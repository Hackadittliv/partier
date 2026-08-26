import { contentHash, normalizeSourceMarkdown } from "./firecrawl";
import { nextSourceCheckAt, type SourceCheckFrequency } from "./source-routing";
import { postgrestQuery, supabaseRequest } from "./supabase";

export type SourceRecord = {
  id: string;
  party_id: string;
  canonical_url: string;
  check_frequency: SourceCheckFrequency;
  consecutive_failures: number;
  metadata: Record<string, unknown>;
};

type Snapshot = {
  id: string;
  content_hash: string;
  content_markdown: string | null;
};

type DetectedChange = { id: string };

export type SourceCheckInput = {
  source: SourceRecord;
  ingestRunId?: string;
  checkedAt?: Date;
  statusCode: number | null;
  finalUrl: string;
  ok: boolean;
  provider: "firecrawl" | "direct_pdf";
  errorMessage?: string | null;
  responseMs?: number | null;
  metadata?: Record<string, unknown>;
};

export type SourceContentInput = SourceCheckInput & {
  markdown: string;
  title?: string | null;
  contentText?: string | null;
  rawMetadata?: Record<string, unknown>;
  diffText?: string | null;
};

async function latestSnapshot(sourceId: string) {
  const query = postgrestQuery({
    select: "id,content_hash,content_markdown",
    source_id: `eq.${sourceId}`,
    order: "fetched_at.desc",
    limit: "1",
  });
  const [snapshot] = await supabaseRequest<Snapshot[]>(`source_snapshots?${query}`);
  return snapshot;
}

async function snapshotByHash(sourceId: string, hash: string) {
  const query = postgrestQuery({
    select: "id,content_hash,content_markdown",
    source_id: `eq.${sourceId}`,
    content_hash: `eq.${hash}`,
    limit: "1",
  });
  const [snapshot] = await supabaseRequest<Snapshot[]>(`source_snapshots?${query}`);
  return snapshot;
}

async function writeLinkCheck(input: SourceCheckInput, checkedAt: Date) {
  await supabaseRequest("link_checks", {
    method: "POST",
    prefer: "return=minimal",
    body: {
      source_id: input.source.id,
      ingest_run_id: input.ingestRunId,
      checked_at: checkedAt.toISOString(),
      status_code: input.statusCode,
      final_url: input.finalUrl,
      ok: input.ok,
      response_ms: input.responseMs ?? null,
      error_message: input.errorMessage ?? null,
      metadata: { provider: input.provider },
    },
  });
}

async function updateSource(
  input: SourceCheckInput,
  checkedAt: Date,
  extra: Record<string, unknown> = {},
) {
  const query = postgrestQuery({ id: `eq.${input.source.id}` });
  await supabaseRequest(`sources?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body: {
      last_checked_at: checkedAt.toISOString(),
      next_check_at: nextSourceCheckAt(input.source.check_frequency, checkedAt),
      last_status_code: input.statusCode,
      last_final_url: input.finalUrl,
      consecutive_failures: input.ok ? 0 : input.source.consecutive_failures + 1,
      ...(input.ok ? { last_success_at: checkedAt.toISOString() } : {}),
      ...(input.metadata ? { metadata: { ...input.source.metadata, ...input.metadata } } : {}),
      ...extra,
    },
  });
}

export async function recordSourceCheck(input: SourceCheckInput) {
  const checkedAt = input.checkedAt ?? new Date();
  await writeLinkCheck(input, checkedAt);
  await updateSource(input, checkedAt);
}

export async function ingestSourceContent(input: SourceContentInput) {
  const checkedAt = input.checkedAt ?? new Date();
  await writeLinkCheck(input, checkedAt);

  const markdown = input.markdown.trim();
  if (!markdown) {
    await updateSource(input, checkedAt);
    return false;
  }

  const normalizedMarkdown = normalizeSourceMarkdown(markdown);
  const hash = contentHash(normalizedMarkdown);
  const previous = await latestSnapshot(input.source.id);
  let snapshot = await snapshotByHash(input.source.id, hash);

  if (!snapshot) {
    const [created] = await supabaseRequest<Snapshot[]>("source_snapshots", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: {
        source_id: input.source.id,
        ingest_run_id: input.ingestRunId,
        fetched_at: checkedAt.toISOString(),
        title: input.title ?? null,
        content_text: input.contentText ?? null,
        content_markdown: markdown,
        content_hash: hash,
        raw_metadata: {
          provider: input.provider,
          ...(input.rawMetadata ?? {}),
        },
      },
    });
    snapshot = created ?? (await snapshotByHash(input.source.id, hash));
  }

  if (!snapshot) {
    throw new Error(`Kunde inte spara ögonblicksbild för ${input.source.canonical_url}`);
  }

  const previousHash = previous?.content_markdown
    ? contentHash(normalizeSourceMarkdown(previous.content_markdown))
    : previous?.content_hash;
  const changed = Boolean(previous && previousHash !== hash);

  if (changed) {
    const [change] = await supabaseRequest<DetectedChange[]>("detected_changes", {
      method: "POST",
      prefer: "resolution=ignore-duplicates,return=representation",
      body: {
        source_id: input.source.id,
        before_snapshot_id: previous?.id ?? null,
        after_snapshot_id: snapshot.id,
        change_kind: "content",
        materiality: "unknown",
        summary: "Källans innehåll har ändrats och väntar på granskning.",
        diff_text: input.diffText ?? null,
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
          party_id: input.source.party_id,
          title: `Ny källändring för ${input.title ?? input.source.canonical_url}`,
          rationale: "Ändringen måste bedömas innan någon partiståndpunkt uppdateras.",
          priority: 70,
          status: "pending",
        },
      });
    }
  }

  await updateSource(input, checkedAt, { last_content_hash: hash });
  return changed;
}
