import type { Context } from "@netlify/functions";

import { postgrestQuery, supabaseRequest } from "./supabase";

type Source = {
  id: string;
  canonical_url: string;
};

type IngestRun = {
  id: string;
};

type TriggerKind = "scheduled" | "manual";

type RunSourceCheckOptions = {
  triggerKind: TriggerKind;
};

export type SourceCheckResult = {
  started: boolean;
  sourcesTotal: number;
  ingestRunId?: string;
  firecrawlJobId?: string;
};

function requiredEnvironmentVariable(name: string) {
  const value = Netlify.env.get(name)?.trim();

  if (!value) {
    throw new Error(`Miljövariabeln ${name} saknas.`);
  }

  return value;
}

async function markRunFailed(runId: string, message: string) {
  const query = postgrestQuery({ id: `eq.${runId}` });

  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_count: 1,
      details: { error: message.slice(0, 1000) },
    },
  });
}

export async function runSourceCheck(
  context: Context,
  { triggerKind }: RunSourceCheckOptions,
): Promise<SourceCheckResult> {
  const firecrawlApiKey = requiredEnvironmentVariable("FIRECRAWL_API_KEY");
  const now = new Date().toISOString();
  const dueQuery = postgrestQuery({
    select: "id,canonical_url",
    active: "eq.true",
    or: `(next_check_at.is.null,next_check_at.lte.${now})`,
    order: "priority.desc",
    limit: "100",
  });
  const sources = await supabaseRequest<Source[]>(`sources?${dueQuery}`);

  if (sources.length === 0) {
    console.log("Inga källor väntar på kontroll.");
    return { started: false, sourcesTotal: 0 };
  }

  const [run] = await supabaseRequest<IngestRun[]>("ingest_runs", {
    method: "POST",
    prefer: "return=representation",
    body: {
      trigger_kind: triggerKind,
      status: "running",
      sources_total: sources.length,
      details: { scheduler: "netlify", requested_at: now },
    },
  });

  if (!run) {
    throw new Error("Kunde inte skapa en körningslogg i Supabase.");
  }

  try {
    const webhookUrl = new URL("/api/firecrawl/webhook", context.site.url).toString();
    const response = await fetch("https://api.firecrawl.dev/v2/batch/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        urls: sources.map((source) => source.canonical_url),
        formats: ["markdown", "summary", "changeTracking"],
        onlyMainContent: true,
        maxAge: 0,
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
      throw new Error(
        `Firecrawl svarade med ${response.status}: ${responseText.slice(0, 500)}`,
      );
    }

    const firecrawlJob = JSON.parse(responseText) as { id?: string; url?: string };
    const updateQuery = postgrestQuery({ id: `eq.${run.id}` });

    await supabaseRequest(`ingest_runs?${updateQuery}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        details: {
          scheduler: "netlify",
          requested_at: now,
          firecrawl_job_id: firecrawlJob.id,
          firecrawl_job_url: firecrawlJob.url,
        },
      },
    });

    console.log(
      `Startade Firecrawl körning ${firecrawlJob.id ?? "utan id"} för ${sources.length} källor.`,
    );

    return {
      started: true,
      sourcesTotal: sources.length,
      ingestRunId: run.id,
      firecrawlJobId: firecrawlJob.id,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    await markRunFailed(run.id, message);
    throw error;
  }
}
