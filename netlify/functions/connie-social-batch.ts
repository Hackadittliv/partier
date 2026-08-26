import { createHash } from "node:crypto";
import type { Config, Context } from "@netlify/functions";
import { z } from "zod";

import {
  analyzeBatchWithConnie,
  connieSocialRequestSchema,
  type ConnieSocialBatchResult,
  type ConnieSocialRequest,
} from "./_shared/connie-social";
import { authorizedConnieWebhook } from "./_shared/connie-webhook-auth";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

const requestSchema = z.object({
  items: z.array(connieSocialRequestSchema).min(1).max(10),
});

type RegisteredSource = {
  id: string;
  party_id: string;
  canonical_url: string;
  metadata: Record<string, unknown>;
};
type IngestRun = { id: string };
type ExistingSocialPost = { id: string; external_post_id: string };
type SocialPost = { id: string };

class SourceVerificationError extends Error {}

async function verifiedSource(input: ConnieSocialRequest) {
  const query = postgrestQuery({
    select: "id,party_id,canonical_url,metadata",
    party_id: `eq.${input.party_id}`,
    source_kind: "eq.social",
    platform: "eq.x",
    canonical_url: `eq.${input.account_url}`,
    official: "eq.true",
    active: "eq.true",
    limit: "1",
  });
  const [source] = await supabaseRequest<RegisteredSource[]>(`sources?${query}`);
  const registeredHandle = typeof source?.metadata.account_handle === "string"
    ? source.metadata.account_handle.replace(/^@/, "").toLowerCase()
    : "";
  if (
    !source
    || source.metadata.status !== "verified"
    || source.metadata.verification_url !== input.verification_url
    || registeredHandle !== input.author_handle.replace(/^@/, "").toLowerCase()
  ) {
    throw new SourceVerificationError("Ett konto matchar inte Sakfrågans verifierade källregister.");
  }
  return source;
}

async function createRun(itemsTotal: number) {
  const [run] = await supabaseRequest<IngestRun[]>("ingest_runs", {
    method: "POST",
    prefer: "return=representation",
    body: {
      trigger_kind: "manual",
      status: "running",
      sources_total: itemsTotal,
      details: {
        collector: "connie_social_mcp_batch",
        batch_size: itemsTotal,
        automatic_x_collection: true,
      },
    },
  });
  if (!run) throw new Error("Kunde inte skapa batchens körningslogg.");
  return run;
}

async function updateRun(runId: string, body: Record<string, unknown>) {
  const query = postgrestQuery({ id: `eq.${runId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body,
  });
}

async function existingPosts(items: ConnieSocialRequest[]) {
  const ids = items.map((item) => item.external_post_id);
  const query = postgrestQuery({
    select: "id,external_post_id",
    platform: "eq.x",
    external_post_id: `in.(${ids.join(",")})`,
    limit: "10",
  });
  return supabaseRequest<ExistingSocialPost[]>(`social_posts?${query}`);
}

function assertResultMatchesInputs(inputs: ConnieSocialRequest[], result: ConnieSocialBatchResult) {
  const inputById = new Map(inputs.map((input) => [input.external_post_id, input]));
  const seen = new Set<string>();
  for (const item of result.items) {
    const input = inputById.get(item.external_post_id);
    const normalizeHandle = (value: string) => value.replace(/^@/, "").toLowerCase();
    if (
      !input
      || seen.has(item.external_post_id)
      || item.party_id !== input.party_id
      || item.url !== input.url
      || normalizeHandle(item.author_handle) !== normalizeHandle(input.author_handle)
      || item.account_url !== input.account_url
      || item.verification_url !== input.verification_url
      || item.body !== input.body
      || item.raw_evidence !== input.body
      || item.source_query !== input.source_query
    ) {
      throw new Error("Connies batchsvar matchar inte de verifierade originalinläggen.");
    }
    seen.add(item.external_post_id);
  }
}

async function storeRelevantItem(
  source: RegisteredSource,
  run: IngestRun,
  result: ConnieSocialBatchResult,
  item: ConnieSocialBatchResult["items"][number],
) {
  const contentHash = createHash("sha256").update(item.body, "utf8").digest("hex");
  const insertQuery = postgrestQuery({ on_conflict: "platform,external_post_id" });
  const [socialPost] = await supabaseRequest<SocialPost[]>(`social_posts?${insertQuery}`, {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=representation",
    body: {
      source_id: source.id,
      ingest_run_id: run.id,
      party_id: item.party_id,
      platform: item.platform,
      external_post_id: item.external_post_id,
      url: item.url,
      author_handle: item.author_handle,
      author_name: item.author_name,
      account_type: item.account_type,
      body: item.body,
      published_at: item.published_at,
      collected_at: item.collected_at,
      post_type: item.post_type,
      thread_id: item.thread_id,
      topic_ids: item.topic_ids,
      statement_type: item.statement_type,
      source_query: item.source_query,
      confidence: item.confidence,
      provider: item.provider,
      model: item.model,
      raw_evidence: item.raw_evidence,
      media_urls: item.media_urls,
      content_hash: contentHash,
      metrics: {
        ...item.metrics,
        connie: {
          run_id: result.run_id,
          uncertainty_reason: item.uncertainty_reason,
          usage: result.usage,
          batch_size: result.items.length,
        },
      },
      review_status: item.confidence < 0.85 || item.uncertainty_reason ? "flagged" : "unreviewed",
    },
  });
  if (!socialPost) return false;

  await supabaseRequest("review_items", {
    method: "POST",
    prefer: "resolution=ignore-duplicates,return=minimal",
    body: {
      item_kind: "social_post",
      item_id: socialPost.id,
      party_id: item.party_id,
      title: `Nytt uttalande från ${item.author_name}`,
      rationale: item.uncertainty_reason
        ?? `Klassificerat av ${item.provider}/${item.model} i en kostnadsoptimerad batch.`,
      priority: item.confidence < 0.85 ? 80 : 50,
      status: "pending",
    },
  });
  return true;
}

async function processBatch(
  items: ConnieSocialRequest[],
  sources: Map<string, RegisteredSource>,
  run: IngestRun,
  duplicatesBeforeAi: number,
) {
  try {
    const result = await analyzeBatchWithConnie(items);
    assertResultMatchesInputs(items, result);
    let stored = 0;
    for (const item of result.items) {
      const source = sources.get(item.external_post_id);
      if (!source) throw new Error("Källkopplingen saknas för ett batchresultat.");
      if (await storeRelevantItem(source, run, result, item)) stored += 1;
    }

    await updateRun(run.id, {
      status: "succeeded",
      finished_at: new Date().toISOString(),
      sources_succeeded: items.length + duplicatesBeforeAi,
      sources_changed: stored,
      details: {
        collector: "connie_social_mcp_batch",
        connie_run_id: result.run_id,
        batch_size: items.length,
        duplicates_skipped_before_ai: duplicatesBeforeAi,
        relevant_items: result.items.length,
        irrelevant_items: items.length - result.items.length,
        stored_items: stored,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
      },
    });
  } catch (error) {
    await updateRun(run.id, {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_count: 1,
      details: {
        collector: "connie_social_mcp_batch",
        batch_size: items.length,
        error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel",
      },
    }).catch(() => undefined);
    console.error("Connie Social batch misslyckades", error instanceof Error ? error.message : error);
  }
}

export default async function connieSocialBatch(request: Request, context: Context) {
  const webhookSecret = Netlify.env.get("CONNIE_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return new Response("Connie Social is not configured", { status: 503 });
  if (!authorizedConnieWebhook(request, webhookSecret)) return new Response("Unauthorized", { status: 401 });
  if (Netlify.env.get("CONNIE_SOCIAL_ENABLED") !== "true") {
    return Response.json({ error: "Connie Social is not enabled" }, { status: 409 });
  }

  let run: IngestRun | undefined;
  try {
    const { items } = requestSchema.parse(await request.json());
    if (new Set(items.map((item) => item.external_post_id)).size !== items.length) {
      return Response.json({ error: "Batchen innehåller dubbla inläggsid:n." }, { status: 400 });
    }

    const verified = await Promise.all(items.map(async (item) => ({
      item,
      source: await verifiedSource(item),
    })));
    const existing = await existingPosts(items);
    const existingIds = new Set(existing.map((post) => post.external_post_id));
    const pending = verified.filter(({ item }) => !existingIds.has(item.external_post_id));
    run = await createRun(items.length);

    if (pending.length === 0) {
      const usage = { input_tokens: 0, output_tokens: 0, cost_usd: 0, latency_ms: 0 };
      await updateRun(run.id, {
        status: "succeeded",
        finished_at: new Date().toISOString(),
        sources_succeeded: items.length,
        details: {
          collector: "connie_social_mcp_batch",
          outcome: "all_duplicates_skipped_before_ai",
          duplicates_skipped_before_ai: items.length,
          usage,
        },
      });
      return Response.json({
        run_id: run.id,
        status: "duplicate",
        accepted_items: 0,
        duplicate_items: items.length,
      });
    }

    const sources = new Map(pending.map(({ item, source }) => [item.external_post_id, source]));
    context.waitUntil(processBatch(
      pending.map(({ item }) => item),
      sources,
      run,
      existingIds.size,
    ));
    return Response.json({
      run_id: run.id,
      status: "accepted",
      accepted_items: pending.length,
      duplicate_items: existingIds.size,
      status_url: `/api/connie/social/runs/${run.id}`,
    }, { status: 202 });
  } catch (error) {
    if (run) {
      await updateRun(run.id, {
        status: "failed",
        finished_at: new Date().toISOString(),
        error_count: 1,
        details: { error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel" },
      }).catch(() => undefined);
    }
    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    if (error instanceof SourceVerificationError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    console.error("Connie Social batch failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Connie Social batch failed" }, { status: 502 });
  }
}

export const config: Config = {
  path: "/api/connie/social/batch",
  method: "POST",
};
