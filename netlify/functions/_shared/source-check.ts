import type { Context } from "@netlify/functions";

import { isPdfSourceUrl } from "./source-routing";
import { postgrestQuery, supabaseRequest } from "./supabase";

type Source = {
  id: string;
  canonical_url: string;
};

type IngestRun = { id: string };
type TriggerKind = "scheduled" | "manual";
type PipelineKind = "firecrawl_web" | "direct_pdf";

type RunSourceCheckOptions = { triggerKind: TriggerKind };

type FirecrawlUsage = {
  remainingCredits: number;
  planCredits: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
};

export type SourceCheckResult = {
  started: boolean;
  sourcesTotal: number;
  webSourcesTotal: number;
  pdfSourcesTotal: number;
  ingestRunId?: string;
  firecrawlJobId?: string;
  pdfIngestRunId?: string;
  firecrawlBlocked?: boolean;
  message?: string;
};

function requiredEnvironmentVariable(name: string) {
  const value = Netlify.env.get(name)?.trim();
  if (!value) throw new Error(`Miljövariabeln ${name} saknas.`);
  return value;
}

function numericEnvironmentVariable(name: string, fallback: number, min: number, max: number) {
  const raw = Netlify.env.get(name)?.trim();
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) {
    throw new Error(`Miljövariabeln ${name} måste vara mellan ${min} och ${max}.`);
  }
  return value;
}

async function createRun(
  triggerKind: TriggerKind,
  pipeline: PipelineKind,
  sourcesTotal: number,
  requestedAt: string,
) {
  const idempotencyKey = triggerKind === "scheduled"
    ? `scheduled:${pipeline}:${requestedAt.slice(0, 10)}`
    : null;
  const resource = idempotencyKey ? "ingest_runs?on_conflict=idempotency_key" : "ingest_runs";
  const [run] = await supabaseRequest<IngestRun[]>(resource, {
    method: "POST",
    prefer: idempotencyKey
      ? "resolution=ignore-duplicates,return=representation"
      : "return=representation",
    body: {
      trigger_kind: triggerKind,
      status: "running",
      sources_total: sourcesTotal,
      idempotency_key: idempotencyKey,
      details: {
        scheduler: "netlify",
        pipeline,
        requested_at: requestedAt,
        estimated_credits: pipeline === "firecrawl_web" ? sourcesTotal : 0,
      },
    },
  });
  return run ?? null;
}

async function updateRun(runId: string, body: Record<string, unknown>) {
  const query = postgrestQuery({ id: `eq.${runId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body,
  });
}

async function firecrawlUsage(apiKey: string) {
  const response = await fetch("https://api.firecrawl.dev/v2/team/credit-usage", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Firecrawls kreditkontroll svarade med ${response.status}.`);
  const payload = await response.json() as { success?: boolean; data?: FirecrawlUsage };
  if (!payload.success || !payload.data) throw new Error("Firecrawl returnerade ingen kreditstatus.");
  return payload.data;
}

async function dispatchPdfRun(context: Context, run: IngestRun, sources: Source[]) {
  const secret = requiredEnvironmentVariable("SAKFRAGAN_MANUAL_TRIGGER_SECRET");
  const endpoint = new URL("/api/automation/pdf-check", context.site.url);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ingest_run_id: run.id,
      source_ids: sources.map((source) => source.id),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`PDF-arbetaren svarade med ${response.status}.`);
}

async function startFirecrawlRun(
  context: Context,
  run: IngestRun,
  sources: Source[],
  requestedAt: string,
) {
  const apiKey = requiredEnvironmentVariable("FIRECRAWL_API_KEY");
  const monthlyBudget = numericEnvironmentVariable("FIRECRAWL_MONTHLY_CREDIT_BUDGET", 600, 1, 1_000_000);
  const perRunBudget = numericEnvironmentVariable("FIRECRAWL_MAX_CREDITS_PER_RUN", 50, 1, 10_000);
  const usage = await firecrawlUsage(apiKey);
  const usedCredits = usage.planCredits - usage.remainingCredits;
  const estimatedCredits = sources.length;
  const budgetBlocked = estimatedCredits > perRunBudget
    || usedCredits >= monthlyBudget
    || usedCredits + estimatedCredits > monthlyBudget;

  if (budgetBlocked) {
    await updateRun(run.id, {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_count: 1,
      details: {
        scheduler: "netlify",
        pipeline: "firecrawl_web",
        requested_at: requestedAt,
        budget_blocked: true,
        estimated_credits: estimatedCredits,
        monthly_credit_budget: monthlyBudget,
        per_run_credit_budget: perRunBudget,
        account_credits_used: usedCredits,
        account_credits_remaining: usage.remainingCredits,
        billing_period_start: usage.billingPeriodStart,
        billing_period_end: usage.billingPeriodEnd,
      },
    });
    return { blocked: true as const };
  }

  const webhookUrl = new URL("/api/firecrawl/webhook", context.site.url).toString();
  const response = await fetch("https://api.firecrawl.dev/v2/batch/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      urls: sources.map((source) => source.canonical_url),
      formats: ["markdown"],
      parsers: [],
      onlyMainContent: true,
      maxAge: 72_000_000,
      maxConcurrency: 5,
      webhook: {
        url: webhookUrl,
        events: ["started", "page", "completed", "failed"],
        metadata: { ingest_run_id: run.id },
      },
    }),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Firecrawl svarade med ${response.status}: ${responseText.slice(0, 500)}`);
  }

  const job = JSON.parse(responseText) as { id?: string; url?: string };
  await updateRun(run.id, {
    details: {
      scheduler: "netlify",
      pipeline: "firecrawl_web",
      requested_at: requestedAt,
      estimated_credits: estimatedCredits,
      monthly_credit_budget: monthlyBudget,
      per_run_credit_budget: perRunBudget,
      account_credits_used_before_run: usedCredits,
      account_credits_remaining_before_run: usage.remainingCredits,
      billing_period_start: usage.billingPeriodStart,
      billing_period_end: usage.billingPeriodEnd,
      firecrawl_job_id: job.id,
      firecrawl_job_url: job.url,
    },
  });
  return { blocked: false as const, job };
}

export async function runSourceCheck(
  context: Context,
  { triggerKind }: RunSourceCheckOptions,
): Promise<SourceCheckResult> {
  const requestedAt = new Date().toISOString();
  const dueQuery = postgrestQuery({
    select: "id,canonical_url",
    active: "eq.true",
    official: "eq.true",
    source_kind: "neq.social",
    check_frequency: "neq.manual",
    or: `(next_check_at.is.null,next_check_at.lte.${requestedAt})`,
    order: "priority.desc",
    limit: "100",
  });
  const sources = await supabaseRequest<Source[]>(`sources?${dueQuery}`);
  if (sources.length === 0) {
    return {
      started: false,
      sourcesTotal: 0,
      webSourcesTotal: 0,
      pdfSourcesTotal: 0,
      message: "Inga källor väntar på kontroll.",
    };
  }

  const pdfSources = sources.filter((source) => isPdfSourceUrl(source.canonical_url));
  const webSources = sources.filter((source) => !isPdfSourceUrl(source.canonical_url));
  let pdfRun: IngestRun | null = null;
  let webRun: IngestRun | null = null;
  let firecrawlJobId: string | undefined;
  let firecrawlBlocked = false;

  if (pdfSources.length > 0) {
    pdfRun = await createRun(triggerKind, "direct_pdf", pdfSources.length, requestedAt);
    if (pdfRun) {
      try {
        await dispatchPdfRun(context, pdfRun, pdfSources);
      } catch (error) {
        await updateRun(pdfRun.id, {
          status: "failed",
          finished_at: new Date().toISOString(),
          error_count: 1,
          details: {
            scheduler: "netlify",
            pipeline: "direct_pdf",
            firecrawl_credits_used: 0,
            error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel",
          },
        });
      }
    }
  }

  if (webSources.length > 0) {
    webRun = await createRun(triggerKind, "firecrawl_web", webSources.length, requestedAt);
    if (webRun) {
      try {
        const result = await startFirecrawlRun(context, webRun, webSources, requestedAt);
        firecrawlBlocked = result.blocked;
        firecrawlJobId = result.blocked ? undefined : result.job.id;
      } catch (error) {
        await updateRun(webRun.id, {
          status: "failed",
          finished_at: new Date().toISOString(),
          error_count: 1,
          details: {
            scheduler: "netlify",
            pipeline: "firecrawl_web",
            requested_at: requestedAt,
            error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel",
          },
        });
        throw error;
      }
    }
  }

  return {
    started: Boolean(pdfRun || webRun),
    sourcesTotal: sources.length,
    webSourcesTotal: webSources.length,
    pdfSourcesTotal: pdfSources.length,
    ingestRunId: webRun?.id,
    firecrawlJobId,
    pdfIngestRunId: pdfRun?.id,
    firecrawlBlocked,
    message: firecrawlBlocked
      ? "Webbkörningen stoppades av kreditbudgeten. PDF-kontrollen använder inga Firecrawl-krediter."
      : undefined,
  };
}
