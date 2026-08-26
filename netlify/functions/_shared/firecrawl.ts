import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export type FirecrawlPage = {
  markdown?: string;
  summary?: string;
  metadata?: {
    sourceURL?: string;
    url?: string;
    title?: string;
    statusCode?: number;
    error?: string;
    [key: string]: unknown;
  };
  changeTracking?: {
    changeStatus?: string;
    diff?: string;
    [key: string]: unknown;
  };
};

export type FirecrawlWebhook = {
  success?: boolean;
  type?: string;
  id?: string;
  data?: FirecrawlPage[];
  metadata?: {
    ingest_run_id?: string;
    [key: string]: unknown;
  };
  error?: string | null;
  creditsUsed?: number;
};

export function contentHash(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

export function normalizeSourceMarkdown(content: string) {
  return content
    .replaceAll("\r\n", "\n")
    .split("\n")
    .filter((line) => !/google\.com\/recaptcha\/api2\/payload/i.test(line))
    .filter((line) => !/^\s*Select all (?:images|squares)\b/i.test(line))
    .map((line) => line
      .replace(/;jsessionid=[a-f0-9]+/gi, ";jsessionid")
      .replace(/fbzx(?:%3D|=)-?\d+/gi, "fbzx")
      .replace(/Totalt antal röster:\s*[\d\s\u00a0]+/gi, "Totalt antal röster")
      .trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function verifyFirecrawlSignature(
  rawBody: string,
  signatureHeader: string | null,
  webhookSecret: string,
) {
  if (!signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const suppliedHex = signatureHeader.slice("sha256=".length);

  if (!/^[a-f0-9]{64}$/i.test(suppliedHex)) {
    return false;
  }

  const expected = Buffer.from(
    createHmac("sha256", webhookSecret).update(rawBody).digest("hex"),
    "hex",
  );
  const supplied = Buffer.from(suppliedHex, "hex");

  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
