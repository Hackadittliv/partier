import type { Config } from "@netlify/functions";

import { authorizedConnieWebhook } from "./_shared/connie-webhook-auth";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

type IngestRun = {
  id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  sources_total: number;
  sources_succeeded: number;
  sources_changed: number;
  error_count: number;
  details: Record<string, unknown>;
};

type FirecrawlUsage = {
  remainingCredits: number;
  planCredits: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
};

function configuredNumber(name: string, fallback: number) {
  const value = Number(Netlify.env.get(name) ?? "");
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function nestedNumber(value: unknown, ...path: string[]) {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== "object") return 0;
    current = (current as Record<string, unknown>)[key];
  }
  return typeof current === "number" && Number.isFinite(current) ? current : 0;
}

async function getFirecrawlUsage() {
  const apiKey = Netlify.env.get("FIRECRAWL_API_KEY")?.trim();
  if (!apiKey) return null;
  const response = await fetch("https://api.firecrawl.dev/v2/team/credit-usage", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return null;
  const payload = await response.json() as { success?: boolean; data?: FirecrawlUsage };
  return payload.success ? payload.data ?? null : null;
}

export default async function automationStatus(request: Request) {
  const secret = Netlify.env.get("SAKFRAGAN_MANUAL_TRIGGER_SECRET")?.trim();
  if (!secret) return new Response("Automation status is not configured", { status: 503 });
  if (!authorizedConnieWebhook(request, secret)) return new Response("Unauthorized", { status: 401 });

  const since = new Date();
  since.setUTCDate(1);
  since.setUTCHours(0, 0, 0, 0);
  const runQuery = postgrestQuery({
    select: "id,status,started_at,finished_at,sources_total,sources_succeeded,sources_changed,error_count,details",
    started_at: `gte.${since.toISOString()}`,
    order: "started_at.desc",
    limit: "250",
  });
  const [runs, firecrawl] = await Promise.all([
    supabaseRequest<IngestRun[]>(`ingest_runs?${runQuery}`),
    getFirecrawlUsage(),
  ]);
  const monthlyBudget = configuredNumber("FIRECRAWL_MONTHLY_CREDIT_BUDGET", 600);
  const loggedFirecrawlCredits = runs.reduce(
    (sum, run) => sum + nestedNumber(run.details, "firecrawl_credits_used"),
    0,
  );
  const xEstimatedCostUsd = runs.reduce(
    (sum, run) => sum + nestedNumber(run.details, "source_usage", "estimated_cost_usd"),
    0,
  );
  const aiCostUsd = runs.reduce(
    (sum, run) => sum + nestedNumber(run.details, "usage", "cost_usd"),
    0,
  );
  const accountUsed = firecrawl ? firecrawl.planCredits - firecrawl.remainingCredits : null;

  return Response.json({
    generated_at: new Date().toISOString(),
    web: {
      automation_enabled: Netlify.env.get("SAKFRAGAN_AUTOMATION_ENABLED") === "true",
      firecrawl: firecrawl ? {
        plan_credits: firecrawl.planCredits,
        remaining_credits: firecrawl.remainingCredits,
        account_credits_used: accountUsed,
        billing_period_start: firecrawl.billingPeriodStart,
        billing_period_end: firecrawl.billingPeriodEnd,
        configured_monthly_budget: monthlyBudget,
        budget_remaining: Math.max(0, monthlyBudget - (accountUsed ?? monthlyBudget)),
        logged_project_credits_this_month: loggedFirecrawlCredits,
      } : null,
      pdf_strategy: "direct_hash_and_local_text_extraction",
    },
    social: {
      collection_enabled: Netlify.env.get("CONNIE_SOCIAL_COLLECTION_ENABLED") === "true",
      estimated_x_source_cost_usd_this_month: Number(xEstimatedCostUsd.toFixed(6)),
      recorded_ai_cost_usd_this_month: Number(aiCostUsd.toFixed(6)),
    },
    recent_runs: runs.slice(0, 25),
  });
}

export const config: Config = {
  path: "/api/automation/status",
  method: "GET",
};
