import type { Config } from "@netlify/functions";

import {
  type FirecrawlPage,
  type FirecrawlWebhook,
  verifyFirecrawlSignature,
} from "./_shared/firecrawl";
import { ingestSourceContent, type SourceRecord } from "./_shared/source-ingestion";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

type IngestRunState = {
  details: Record<string, unknown>;
  sources_total: number;
};

type LinkCheckState = { ok: boolean };
type SnapshotReference = { id: string };
type DetectedChange = { id: string };

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
}

async function findSource(sourceUrl: string) {
  const query = postgrestQuery({
    select: "id,party_id,canonical_url,check_frequency,consecutive_failures,metadata",
    canonical_url: `eq.${sourceUrl}`,
    limit: "1",
  });
  const [source] = await supabaseRequest<SourceRecord[]>(`sources?${query}`);
  return source;
}

async function processPage(page: FirecrawlPage, ingestRunId?: string) {
  const sourceUrl = firstString(page.metadata?.sourceURL, page.metadata?.url);
  if (!sourceUrl) throw new Error("Firecrawl resultatet saknar källadress.");

  const source = await findSource(sourceUrl);
  if (!source) throw new Error(`Källan finns inte registrerad: ${sourceUrl}`);

  const statusCode = typeof page.metadata?.statusCode === "number" ? page.metadata.statusCode : null;
  const ok = statusCode === null || (statusCode >= 200 && statusCode < 400);
  const finalUrl = firstString(page.metadata?.url, page.metadata?.sourceURL) ?? sourceUrl;

  return ingestSourceContent({
    source,
    ingestRunId,
    statusCode,
    finalUrl,
    ok,
    provider: "firecrawl",
    errorMessage: page.metadata?.error ?? null,
    markdown: page.markdown ?? "",
    title: page.metadata?.title ?? null,
    rawMetadata: { page_metadata: page.metadata ?? {} },
  });
}

async function firecrawlCreditsUsed(payload: FirecrawlWebhook) {
  if (typeof payload.creditsUsed === "number") return payload.creditsUsed;
  if (!payload.id) return null;

  const apiKey = Netlify.env.get("FIRECRAWL_API_KEY")?.trim();
  if (!apiKey) return null;

  try {
    const response = await fetch(`https://api.firecrawl.dev/v2/batch/scrape/${payload.id}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) return null;
    const result = await response.json() as { creditsUsed?: number };
    return typeof result.creditsUsed === "number" ? result.creditsUsed : null;
  } catch {
    return null;
  }
}

async function finishRun(ingestRunId: string, payload: FirecrawlWebhook) {
  const runQuery = postgrestQuery({
    select: "details,sources_total",
    id: `eq.${ingestRunId}`,
    limit: "1",
  });
  const linkQuery = postgrestQuery({ select: "ok", ingest_run_id: `eq.${ingestRunId}` });
  const snapshotQuery = postgrestQuery({ select: "id", ingest_run_id: `eq.${ingestRunId}` });
  const [[run], linkChecks, snapshots, creditsUsed] = await Promise.all([
    supabaseRequest<IngestRunState[]>(`ingest_runs?${runQuery}`),
    supabaseRequest<LinkCheckState[]>(`link_checks?${linkQuery}`),
    supabaseRequest<SnapshotReference[]>(`source_snapshots?${snapshotQuery}`),
    firecrawlCreditsUsed(payload),
  ]);
  const successfulSources = linkChecks.filter((check) => check.ok).length;
  const failedChecks = linkChecks.length - successfulSources;
  const missingResults = Math.max(0, (run?.sources_total ?? 0) - linkChecks.length);
  const upstreamFailed = payload.type === "batch_scrape.failed";
  const errorCount = failedChecks + missingResults + (upstreamFailed ? 1 : 0);
  let changedSources = 0;

  if (snapshots.length > 0) {
    const changeQuery = postgrestQuery({
      select: "id",
      after_snapshot_id: `in.(${snapshots.map((snapshot) => snapshot.id).join(",")})`,
    });
    const changes = await supabaseRequest<DetectedChange[]>(`detected_changes?${changeQuery}`);
    changedSources = changes.length;
  }

  const status = upstreamFailed ? "failed" : errorCount > 0 ? "partial" : "succeeded";
  const query = postgrestQuery({ id: `eq.${ingestRunId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      status,
      finished_at: new Date().toISOString(),
      sources_succeeded: successfulSources,
      sources_changed: changedSources,
      error_count: errorCount,
      details: {
        ...(run?.details ?? {}),
        firecrawl_job_id: payload.id,
        firecrawl_event: payload.type,
        firecrawl_credits_used: creditsUsed,
        error: payload.error ?? null,
      },
    },
  });
}

export default async function firecrawlWebhook(request: Request) {
  if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const webhookSecret = Netlify.env.get("FIRECRAWL_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return new Response("Webhook is not configured", { status: 503 });

  const rawBody = await request.text();
  const signature = request.headers.get("x-firecrawl-signature");
  if (!verifyFirecrawlSignature(rawBody, signature, webhookSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as FirecrawlWebhook;
  const ingestRunId = payload.metadata?.ingest_run_id;

  try {
    if (payload.type === "batch_scrape.page") {
      for (const page of payload.data ?? []) await processPage(page, ingestRunId);
    }

    if (
      ingestRunId
      && (payload.type === "batch_scrape.completed" || payload.type === "batch_scrape.failed")
    ) {
      await finishRun(ingestRunId, payload);
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    return new Response("Webhook processing failed", { status: 500 });
  }
}

export const config: Config = {
  path: "/api/firecrawl/webhook",
  method: "POST",
};
