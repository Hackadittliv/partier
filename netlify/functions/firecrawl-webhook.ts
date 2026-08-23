import type { Config } from "@netlify/functions";

import {
  contentHash,
  type FirecrawlPage,
  type FirecrawlWebhook,
  verifyFirecrawlSignature,
} from "./_shared/firecrawl";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

type Source = {
  id: string;
  party_id: string;
  canonical_url: string;
  consecutive_failures: number;
};

type Snapshot = {
  id: string;
  content_hash: string;
};

type DetectedChange = {
  id: string;
};

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.length > 0);
}

async function findSource(sourceUrl: string) {
  const query = postgrestQuery({
    select: "id,party_id,canonical_url,consecutive_failures",
    canonical_url: `eq.${sourceUrl}`,
    limit: "1",
  });
  const [source] = await supabaseRequest<Source[]>(`sources?${query}`);
  return source;
}

async function latestSnapshot(sourceId: string) {
  const query = postgrestQuery({
    select: "id,content_hash",
    source_id: `eq.${sourceId}`,
    order: "fetched_at.desc",
    limit: "1",
  });
  const [snapshot] = await supabaseRequest<Snapshot[]>(`source_snapshots?${query}`);
  return snapshot;
}

async function snapshotByHash(sourceId: string, hash: string) {
  const query = postgrestQuery({
    select: "id,content_hash",
    source_id: `eq.${sourceId}`,
    content_hash: `eq.${hash}`,
    limit: "1",
  });
  const [snapshot] = await supabaseRequest<Snapshot[]>(`source_snapshots?${query}`);
  return snapshot;
}

async function processPage(page: FirecrawlPage, ingestRunId?: string) {
  const sourceUrl = firstString(page.metadata?.sourceURL, page.metadata?.url);

  if (!sourceUrl) {
    throw new Error("Firecrawl resultatet saknar källadress.");
  }

  const source = await findSource(sourceUrl);

  if (!source) {
    throw new Error(`Källan finns inte registrerad: ${sourceUrl}`);
  }

  const statusCode = typeof page.metadata?.statusCode === "number" ? page.metadata.statusCode : null;
  const ok = statusCode === null || (statusCode >= 200 && statusCode < 400);
  const finalUrl = firstString(page.metadata?.url, page.metadata?.sourceURL) ?? sourceUrl;
  const now = new Date();
  const nextCheck = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await supabaseRequest("link_checks", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      source_id: source.id,
      ingest_run_id: ingestRunId,
      checked_at: now.toISOString(),
      status_code: statusCode,
      final_url: finalUrl,
      ok,
      error_message: page.metadata?.error ?? null,
      metadata: { provider: "firecrawl" },
    },
  });

  const markdown = page.markdown?.trim() ?? "";

  if (!markdown) {
    const updateQuery = postgrestQuery({ id: `eq.${source.id}` });
    await supabaseRequest(`sources?${updateQuery}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        last_checked_at: now.toISOString(),
        last_status_code: statusCode,
        last_final_url: finalUrl,
        next_check_at: nextCheck.toISOString(),
        consecutive_failures: ok ? 0 : source.consecutive_failures + 1,
        ...(ok ? { last_success_at: now.toISOString() } : {}),
      },
    });
    return false;
  }

  const hash = contentHash(markdown);
  const previous = await latestSnapshot(source.id);
  let snapshot = await snapshotByHash(source.id, hash);

  if (!snapshot) {
    const [created] = await supabaseRequest<Snapshot[]>("source_snapshots", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: {
        source_id: source.id,
        ingest_run_id: ingestRunId,
        fetched_at: now.toISOString(),
        title: page.metadata?.title ?? null,
        content_text: page.summary ?? null,
        content_markdown: markdown,
        content_hash: hash,
        raw_metadata: {
          provider: "firecrawl",
          page_metadata: page.metadata ?? {},
          change_tracking: page.changeTracking ?? {},
        },
      },
    });
    snapshot = created ?? (await snapshotByHash(source.id, hash));
  }

  if (!snapshot) {
    throw new Error(`Kunde inte spara ögonblicksbild för ${sourceUrl}`);
  }

  const changed = Boolean(previous && previous.content_hash !== hash);

  if (changed) {
    const [change] = await supabaseRequest<DetectedChange[]>("detected_changes", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: {
        source_id: source.id,
        before_snapshot_id: previous?.id ?? null,
        after_snapshot_id: snapshot.id,
        change_kind: "content",
        materiality: "unknown",
        summary: "Källans innehåll har ändrats och väntar på granskning.",
        diff_text: page.changeTracking?.diff ?? null,
        status: "pending",
      },
    });

    if (change) {
      await supabaseRequest("review_items", {
        method: "POST",
        prefer: "resolution=ignore-duplicates,return=minimal",
        body: {
          item_kind: "change",
          item_id: change.id,
          party_id: source.party_id,
          title: `Ny källändring för ${page.metadata?.title ?? sourceUrl}`,
          rationale: "Ändringen måste bedömas innan någon partiståndpunkt uppdateras.",
          priority: 70,
          status: "pending",
        },
      });
    }
  }

  const sourceUpdateQuery = postgrestQuery({ id: `eq.${source.id}` });
  await supabaseRequest(`sources?${sourceUpdateQuery}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      last_checked_at: now.toISOString(),
      next_check_at: nextCheck.toISOString(),
      last_status_code: statusCode,
      last_final_url: finalUrl,
      last_content_hash: hash,
      consecutive_failures: ok ? 0 : source.consecutive_failures + 1,
      ...(ok ? { last_success_at: now.toISOString() } : {}),
    },
  });

  return changed;
}

async function finishRun(ingestRunId: string, payload: FirecrawlWebhook) {
  const status = payload.type === "batch_scrape.failed" ? "failed" : "succeeded";
  const query = postgrestQuery({ id: `eq.${ingestRunId}` });

  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      status,
      finished_at: new Date().toISOString(),
      error_count: status === "failed" ? 1 : 0,
      details: {
        firecrawl_job_id: payload.id,
        firecrawl_event: payload.type,
        error: payload.error ?? null,
      },
    },
  });
}

export default async function firecrawlWebhook(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const webhookSecret = Netlify.env.get("FIRECRAWL_WEBHOOK_SECRET")?.trim();

  if (!webhookSecret) {
    return new Response("Webhook is not configured", { status: 503 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-firecrawl-signature");

  if (!verifyFirecrawlSignature(rawBody, signature, webhookSecret)) {
    return new Response("Invalid signature", { status: 401 });
  }

  const payload = JSON.parse(rawBody) as FirecrawlWebhook;
  const ingestRunId = payload.metadata?.ingest_run_id;

  try {
    if (payload.type === "batch_scrape.page") {
      for (const page of payload.data ?? []) {
        await processPage(page, ingestRunId);
      }
    }

    if (
      ingestRunId &&
      (payload.type === "batch_scrape.completed" || payload.type === "batch_scrape.failed")
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
