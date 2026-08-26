import type { Config } from "@netlify/functions";
import { z } from "zod";

import { authorizedConnieWebhook } from "./_shared/connie-webhook-auth";
import { processPdfSource } from "./_shared/pdf-source";
import { recordSourceCheck, type SourceRecord } from "./_shared/source-ingestion";
import { isPdfSourceUrl } from "./_shared/source-routing";
import { postgrestQuery, supabaseRequest } from "./_shared/supabase";

const requestSchema = z.object({
  ingest_run_id: z.uuid(),
  source_ids: z.array(z.uuid()).min(1).max(25),
});

type PdfSource = SourceRecord & { title: string };
type RunState = { details: Record<string, unknown> };
type LinkCheckReference = { id: number };

async function updateRun(runId: string, body: Record<string, unknown>) {
  const query = postgrestQuery({ id: `eq.${runId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body,
  });
}

async function recordUncapturedFailure(source: PdfSource, runId: string, message: string) {
  const existingQuery = postgrestQuery({
    select: "id",
    source_id: `eq.${source.id}`,
    ingest_run_id: `eq.${runId}`,
    limit: "1",
  });
  const existing = await supabaseRequest<LinkCheckReference[]>(`link_checks?${existingQuery}`);
  if (existing.length > 0) return;

  await recordSourceCheck({
    source,
    ingestRunId: runId,
    statusCode: null,
    finalUrl: source.canonical_url,
    ok: false,
    provider: "direct_pdf",
    errorMessage: message.slice(0, 1_000),
  });
}

export default async function pdfSourceCheckBackground(request: Request) {
  if (request.method !== "POST") return;

  const secret = Netlify.env.get("SAKFRAGAN_MANUAL_TRIGGER_SECRET")?.trim();
  if (!secret || !authorizedConnieWebhook(request, secret)) return;

  let runId: string | undefined;
  try {
    const input = requestSchema.parse(await request.json());
    runId = input.ingest_run_id;
    const sourceQuery = postgrestQuery({
      select: "id,party_id,title,canonical_url,check_frequency,consecutive_failures,metadata",
      id: `in.(${input.source_ids.join(",")})`,
      official: "eq.true",
      active: "eq.true",
      source_kind: "neq.social",
      limit: "25",
    });
    const sources = (await supabaseRequest<PdfSource[]>(`sources?${sourceQuery}`))
      .filter((source) => isPdfSourceUrl(source.canonical_url));
    const runQuery = postgrestQuery({ select: "details", id: `eq.${runId}`, limit: "1" });
    const [run] = await supabaseRequest<RunState[]>(`ingest_runs?${runQuery}`);

    let succeeded = 0;
    let changed = 0;
    let failed = 0;
    let pagesParsed = 0;
    let bytesDownloaded = 0;
    const errors: Array<{ source_id: string; message: string }> = [];

    for (const source of sources) {
      try {
        const result = await processPdfSource(source, runId);
        succeeded += result.succeeded ? 1 : 0;
        changed += result.changed ? 1 : 0;
        pagesParsed += result.pagesParsed;
        bytesDownloaded += result.bytesDownloaded;
      } catch (error) {
        failed += 1;
        const message = error instanceof Error ? error.message : "Okänt PDF-fel";
        errors.push({ source_id: source.id, message: message.slice(0, 500) });
        await recordUncapturedFailure(source, runId, message).catch(() => undefined);
      }
    }

    const missing = Math.max(0, input.source_ids.length - sources.length);
    failed += missing;
    await updateRun(runId, {
      status: failed === 0 ? "succeeded" : succeeded > 0 ? "partial" : "failed",
      finished_at: new Date().toISOString(),
      sources_succeeded: succeeded,
      sources_changed: changed,
      error_count: failed,
      details: {
        ...(run?.details ?? {}),
        pipeline: "direct_pdf",
        firecrawl_credits_used: 0,
        pdf_pages_parsed: pagesParsed,
        pdf_bytes_downloaded: bytesDownloaded,
        errors,
      },
    });
  } catch (error) {
    if (runId) {
      await updateRun(runId, {
        status: "failed",
        finished_at: new Date().toISOString(),
        error_count: 1,
        details: {
          pipeline: "direct_pdf",
          firecrawl_credits_used: 0,
          error: error instanceof Error ? error.message.slice(0, 1_000) : "Okänt fel",
        },
      }).catch(() => undefined);
    }
    console.error("PDF-källkontrollen misslyckades", error instanceof Error ? error.message : error);
  }
}

export const config: Config = {
  path: "/api/automation/pdf-check",
  method: "POST",
};
