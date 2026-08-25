import { createHash, timingSafeEqual } from "node:crypto";
import type { Config } from "@netlify/functions";
import { z } from "zod";
import {
  analyzeWithConnie,
  connieSocialRequestSchema,
  type ConnieSocialResult,
} from "./_shared/connie-social";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

const requestEnvelopeSchema = z.union([
  connieSocialRequestSchema,
  z.object({ item: connieSocialRequestSchema }),
]).transform((value) => "item" in value ? value.item : value);

type RegisteredSource = {
  id: string;
  party_id: string;
  canonical_url: string;
  metadata: Record<string, unknown>;
};

type IngestRun = { id: string };
type SocialPost = { id: string };
type ExistingSocialPost = { id: string };

class SourceVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SourceVerificationError";
  }
}

function authorized(request: Request, expectedSecret: string) {
  const authorization = request.headers.get("authorization") ?? "";
  const suppliedSecret = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";
  const supplied = Buffer.from(suppliedSecret);
  const expected = Buffer.from(expectedSecret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

async function verifiedSource(input: z.infer<typeof connieSocialRequestSchema>) {
  const query = postgrestQuery({
    select: "id,party_id,canonical_url,metadata",
    party_id: `eq.${input.party_id}`,
    source_kind: "eq.social",
    platform: "eq.x",
    canonical_url: `eq.${input.account_url}`,
    official: "eq.true",
    active: "eq.true",
    limit: "2",
  });
  const sources = await supabaseRequest<RegisteredSource[]>(`sources?${query}`);
  const source = sources[0];
  if (!source) {
    throw new SourceVerificationError("Kontot finns inte i Sakfrågans verifierade källregister.");
  }

  const status = source.metadata.status;
  const verificationUrl = source.metadata.verification_url;
  const registeredHandle = source.metadata.account_handle;
  const suppliedHandle = input.author_handle.replace(/^@/, "").toLowerCase();
  const expectedHandle = typeof registeredHandle === "string"
    ? registeredHandle.replace(/^@/, "").toLowerCase()
    : "";

  if (
    status !== "verified"
    || verificationUrl !== input.verification_url
    || !expectedHandle
    || expectedHandle !== suppliedHandle
  ) {
    throw new SourceVerificationError("Kontots handle eller verifieringslänk matchar inte källregistret.");
  }
  return source;
}

async function createRun(source: RegisteredSource) {
  const [run] = await supabaseRequest<IngestRun[]>("ingest_runs", {
    method: "POST",
    prefer: "return=representation",
    body: {
      trigger_kind: "manual",
      status: "running",
      sources_total: 1,
      details: {
        collector: "connie_social_mcp",
        source_id: source.id,
        automatic_x_collection: false,
      },
    },
  });
  if (!run) throw new Error("Kunde inte skapa ingest run.");
  return run;
}

async function findExistingPost(input: z.infer<typeof connieSocialRequestSchema>) {
  const query = postgrestQuery({
    select: "id",
    platform: `eq.${input.platform}`,
    external_post_id: `eq.${input.external_post_id}`,
    limit: "1",
  });
  const posts = await supabaseRequest<ExistingSocialPost[]>(`social_posts?${query}`);
  return posts[0] ?? null;
}

async function updateRun(runId: string, body: Record<string, unknown>) {
  const query = postgrestQuery({ id: `eq.${runId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body,
  });
}

function assertResultMatchesInput(
  input: z.infer<typeof connieSocialRequestSchema>,
  result: ConnieSocialResult,
) {
  const item = result.items[0];
  if (!item) return;

  const normalizeHandle = (value: string) => value.replace(/^@/, "").toLowerCase();
  const matchesOriginal =
    item.party_id === input.party_id
    && item.platform === input.platform
    && item.external_post_id === input.external_post_id
    && item.url === input.url
    && normalizeHandle(item.author_handle) === normalizeHandle(input.author_handle)
    && item.account_url === input.account_url
    && item.verification_url === input.verification_url
    && item.body === input.body
    && item.raw_evidence === input.body
    && item.source_query === input.source_query;

  if (!matchesOriginal) {
    throw new Error("Connies svar matchar inte det verifierade originalinlägget.");
  }
}

async function storeResult(source: RegisteredSource, run: IngestRun, result: ConnieSocialResult) {
  const item = result.items[0];
  if (!item) {
    await updateRun(run.id, {
      status: "succeeded",
      finished_at: new Date().toISOString(),
      sources_succeeded: 1,
      details: {
        collector: "connie_social_mcp",
        connie_run_id: result.run_id,
        outcome: "irrelevant",
        provider: result.provider,
        model: result.model,
        usage: result.usage,
      },
    });
    return { stored: false, duplicate: false, reviewItemCreated: false };
  }

  const contentHash = createHash("sha256").update(item.body, "utf8").digest("hex");
  const insertQuery = postgrestQuery({ on_conflict: "platform,external_post_id" });
  const inserted = await supabaseRequest<SocialPost[]>(`social_posts?${insertQuery}`, {
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
          status: result.status,
          uncertainty_reason: item.uncertainty_reason,
          usage: result.usage,
        },
      },
      review_status: result.status === "needs_review" ? "flagged" : "unreviewed",
    },
  });

  const socialPost = inserted[0];
  const duplicate = !socialPost;
  if (socialPost) {
    await supabaseRequest("review_items", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=minimal",
      body: {
        item_kind: "social_post",
        item_id: socialPost.id,
        party_id: item.party_id,
        title: `Nytt uttalande från ${item.author_name}`,
        rationale: item.uncertainty_reason
          ?? `Klassificerat av ${item.provider}/${item.model}. Originaltext och metadata måste granskas före publicering.`,
        priority: item.confidence < 0.85 ? 80 : 50,
        status: "pending",
      },
    });
  }

  await updateRun(run.id, {
    status: "succeeded",
    finished_at: new Date().toISOString(),
    sources_succeeded: 1,
    sources_changed: socialPost ? 1 : 0,
    details: {
      collector: "connie_social_mcp",
      connie_run_id: result.run_id,
      outcome: duplicate ? "duplicate" : "review_pending",
      provider: result.provider,
      model: result.model,
      usage: result.usage,
    },
  });

  return { stored: Boolean(socialPost), duplicate, reviewItemCreated: Boolean(socialPost) };
}

export default async function connieSocial(request: Request) {
  const webhookSecret = Netlify.env.get("CONNIE_WEBHOOK_SECRET")?.trim();
  if (!webhookSecret) return new Response("Connie Social is not configured", { status: 503 });
  if (!authorized(request, webhookSecret)) return new Response("Unauthorized", { status: 401 });
  if (Netlify.env.get("CONNIE_SOCIAL_ENABLED") !== "true") {
    return Response.json({ error: "Connie Social is not enabled" }, { status: 409 });
  }

  let run: IngestRun | undefined;
  try {
    const input = requestEnvelopeSchema.parse(await request.json());
    const source = await verifiedSource(input);
    run = await createRun(source);
    const existingPost = await findExistingPost(input);
    if (existingPost) {
      const usage = { input_tokens: 0, output_tokens: 0, cost_usd: 0, latency_ms: 0 };
      await updateRun(run.id, {
        status: "succeeded",
        finished_at: new Date().toISOString(),
        sources_succeeded: 1,
        details: {
          collector: "connie_social_mcp",
          outcome: "duplicate_skipped_before_ai",
          existing_social_post_id: existingPost.id,
          usage,
        },
      });
      return Response.json({
        run_id: run.id,
        connie_run_id: null,
        status: "duplicate",
        provider: null,
        model: null,
        usage,
        stored: false,
        duplicate: true,
        reviewItemCreated: false,
      });
    }

    const result = await analyzeWithConnie(input);
    assertResultMatchesInput(input, result);
    const storage = await storeResult(source, run, result);
    return Response.json({
      run_id: run.id,
      connie_run_id: result.run_id,
      status: result.status,
      provider: result.provider,
      model: result.model,
      usage: result.usage,
      ...storage,
    });
  } catch (error) {
    if (run) {
      await updateRun(run.id, {
        status: "failed",
        finished_at: new Date().toISOString(),
        error_count: 1,
        details: {
          collector: "connie_social_mcp",
          error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel",
        },
      }).catch(() => undefined);
    }

    if (error instanceof z.ZodError) {
      return Response.json({ error: "Invalid request", issues: error.issues }, { status: 400 });
    }
    if (error instanceof SourceVerificationError) {
      return Response.json({ error: error.message }, { status: 422 });
    }
    console.error("Connie Social failed", error instanceof Error ? error.message : error);
    return Response.json({ error: "Connie Social failed" }, { status: 502 });
  }
}

export const config: Config = {
  path: "/api/connie/social",
  method: "POST",
};
