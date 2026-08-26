import { createHash } from "node:crypto";
import { extractText, getDocumentProxy } from "unpdf";

import {
  ingestSourceContent,
  recordSourceCheck,
  type SourceRecord,
} from "./source-ingestion";
import { isPdfSourceUrl } from "./source-routing";

const DEFAULT_MAX_PDF_BYTES = 30 * 1024 * 1024;

function optionalMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function maxPdfBytes() {
  const configured = Number(Netlify.env.get("SAKFRAGAN_PDF_MAX_BYTES") ?? "");
  return Number.isFinite(configured) && configured >= 1_000_000
    ? Math.floor(configured)
    : DEFAULT_MAX_PDF_BYTES;
}

function responseMetadata(response: Response, checkedAt: string) {
  return {
    pdf_etag: response.headers.get("etag"),
    pdf_last_modified: response.headers.get("last-modified"),
    pdf_content_length: response.headers.get("content-length"),
    pdf_checked_at: checkedAt,
  };
}

export { isPdfSourceUrl };
export type PdfSourceResult = {
  succeeded: boolean;
  changed: boolean;
  unchanged: boolean;
  bytesDownloaded: number;
  pagesParsed: number;
};

export async function processPdfSource(
  source: SourceRecord & { title: string },
  ingestRunId: string,
): Promise<PdfSourceResult> {
  const startedAt = Date.now();
  const checkedAt = new Date();
  const headers = new Headers({
    Accept: "application/pdf",
    "User-Agent": "Sakfragan/1.0 (+https://sakfragan.netlify.app)",
  });
  const etag = optionalMetadataString(source.metadata, "pdf_etag");
  const lastModified = optionalMetadataString(source.metadata, "pdf_last_modified");
  if (etag) headers.set("If-None-Match", etag);
  if (lastModified) headers.set("If-Modified-Since", lastModified);

  const response = await fetch(source.canonical_url, {
    headers,
    redirect: "follow",
    signal: AbortSignal.timeout(60_000),
  });
  const finalUrl = response.url || source.canonical_url;
  const metadata = responseMetadata(response, checkedAt.toISOString());

  if (response.status === 304) {
    await recordSourceCheck({
      source,
      ingestRunId,
      checkedAt,
      statusCode: 304,
      finalUrl,
      ok: true,
      provider: "direct_pdf",
      responseMs: Date.now() - startedAt,
      metadata,
    });
    return { succeeded: true, changed: false, unchanged: true, bytesDownloaded: 0, pagesParsed: 0 };
  }

  if (!response.ok) {
    await recordSourceCheck({
      source,
      ingestRunId,
      checkedAt,
      statusCode: response.status,
      finalUrl,
      ok: false,
      provider: "direct_pdf",
      responseMs: Date.now() - startedAt,
      errorMessage: `PDF-källan svarade med ${response.status}.`,
      metadata,
    });
    throw new Error(`PDF-källan svarade med ${response.status}: ${source.canonical_url}`);
  }

  const declaredBytes = Number(response.headers.get("content-length") ?? "0");
  const maximumBytes = maxPdfBytes();
  if (Number.isFinite(declaredBytes) && declaredBytes > maximumBytes) {
    throw new Error(`PDF-källan är större än tillåtet tak på ${maximumBytes} byte.`);
  }

  const buffer = new Uint8Array(await response.arrayBuffer());
  if (buffer.byteLength > maximumBytes) {
    throw new Error(`PDF-källan är större än tillåtet tak på ${maximumBytes} byte.`);
  }

  const binaryHash = createHash("sha256").update(buffer).digest("hex");
  const previousBinaryHash = optionalMetadataString(source.metadata, "pdf_binary_hash");
  const pdfMetadata = {
    ...metadata,
    pdf_binary_hash: binaryHash,
    pdf_bytes: buffer.byteLength,
    pdf_parser: "unpdf@1.8.1",
  };

  if (previousBinaryHash === binaryHash) {
    await recordSourceCheck({
      source,
      ingestRunId,
      checkedAt,
      statusCode: response.status,
      finalUrl,
      ok: true,
      provider: "direct_pdf",
      responseMs: Date.now() - startedAt,
      metadata: pdfMetadata,
    });
    return {
      succeeded: true,
      changed: false,
      unchanged: true,
      bytesDownloaded: buffer.byteLength,
      pagesParsed: 0,
    };
  }

  const document = await getDocumentProxy(buffer);
  const extracted = await extractText(document, { mergePages: true });
  const text = extracted.text.trim();
  if (!text) throw new Error(`PDF-källan saknar extraherbar text: ${source.canonical_url}`);

  const changed = await ingestSourceContent({
    source,
    ingestRunId,
    checkedAt,
    statusCode: response.status,
    finalUrl,
    ok: true,
    provider: "direct_pdf",
    responseMs: Date.now() - startedAt,
    metadata: { ...pdfMetadata, pdf_pages: extracted.totalPages },
    markdown: `# ${source.title}\n\n${text}`,
    title: source.title,
    contentText: text,
    rawMetadata: {
      binary_hash: binaryHash,
      bytes: buffer.byteLength,
      pages: extracted.totalPages,
      etag: response.headers.get("etag"),
      last_modified: response.headers.get("last-modified"),
    },
  });

  return {
    succeeded: true,
    changed,
    unchanged: !changed,
    bytesDownloaded: buffer.byteLength,
    pagesParsed: extracted.totalPages,
  };
}
