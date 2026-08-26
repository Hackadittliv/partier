import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { z } from "zod";

const topicSchema = z.enum([
  "ekonomi_och_skatt",
  "vard_och_omsorg",
  "skola_och_familj",
  "brott_och_trygghet",
  "migration",
  "klimat_och_natur",
  "energi",
  "demokrati_och_eu",
  "regeringsfragan",
  "ovrigt",
]);

const statementTypeSchema = z.enum([
  "policy_position",
  "election_pledge",
  "proposal",
  "reaction",
  "government_statement",
  "campaign_message",
  "correction",
  "other",
]);

const httpsUrlSchema = z.url().refine((value) => new URL(value).protocol === "https:");

export const connieSocialRequestSchema = z.object({
  party_id: z.string().trim().min(1).max(100),
  platform: z.literal("x"),
  external_post_id: z.string().trim().min(1).max(200),
  url: httpsUrlSchema,
  author_handle: z.string().trim().regex(/^@?[A-Za-z0-9_]{1,50}$/),
  author_name: z.string().trim().min(1).max(200),
  account_type: z.literal("central_party"),
  account_url: httpsUrlSchema,
  verification_url: httpsUrlSchema,
  account_verified: z.literal(true),
  body: z.string().trim().min(1).max(50_000),
  published_at: z.iso.datetime({ offset: true }).nullable(),
  post_type: z.enum(["original", "thread", "quote", "reply"]),
  thread_id: z.string().trim().min(1).max(200).nullable().default(null),
  source_query: z.string().trim().min(1).max(1_000),
  metrics: z.record(z.string(), z.unknown()).default({}),
  media_urls: z.array(httpsUrlSchema).max(20).default([]),
});

export type ConnieSocialRequest = z.infer<typeof connieSocialRequestSchema>;

const connieSocialItemSchema = z.object({
  party_id: z.string(),
  platform: z.literal("x"),
  external_post_id: z.string(),
  url: z.url(),
  author_handle: z.string(),
  author_name: z.string(),
  account_type: z.literal("central_party"),
  account_url: z.url(),
  verification_url: z.url(),
  body: z.string(),
  published_at: z.string().nullable(),
  collected_at: z.string(),
  post_type: z.enum(["original", "thread", "quote", "reply"]),
  thread_id: z.string().nullable(),
  topic_ids: z.array(topicSchema),
  statement_type: statementTypeSchema,
  source_query: z.string(),
  metrics: z.record(z.string(), z.unknown()),
  confidence: z.number().min(0).max(1),
  uncertainty_reason: z.string().nullable(),
  provider: z.string(),
  model: z.string(),
  raw_evidence: z.string(),
  media_urls: z.array(z.url()),
});

const usageSchema = z.object({
  input_tokens: z.number().int().nonnegative(),
  output_tokens: z.number().int().nonnegative(),
  cost_usd: z.number().nonnegative(),
  latency_ms: z.number().int().nonnegative(),
});

export const connieSocialResultSchema = z.object({
  run_id: z.uuid(),
  agent: z.literal("Connie Social"),
  platform: z.literal("x"),
  provider: z.string(),
  model: z.string(),
  collected_at: z.string(),
  status: z.enum(["classified", "needs_review", "irrelevant"]),
  items: z.array(connieSocialItemSchema).max(1),
  usage: usageSchema,
});

export type ConnieSocialResult = z.infer<typeof connieSocialResultSchema>;

export const connieSocialBatchResultSchema = z.object({
  run_id: z.uuid(),
  agent: z.literal("Connie Social"),
  platform: z.literal("x"),
  provider: z.string(),
  model: z.string(),
  collected_at: z.string(),
  status: z.enum(["classified", "needs_review", "irrelevant"]),
  items: z.array(connieSocialItemSchema).max(10),
  usage: usageSchema,
});

export type ConnieSocialBatchResult = z.infer<typeof connieSocialBatchResultSchema>;

const capabilitiesSchema = z.object({
  service: z.literal("Connie Social"),
  analysis_available: z.boolean(),
  x_access_verified: z.literal(false),
  automated_collection_enabled: z.literal(false),
});

function requiredEnvironmentVariable(name: string) {
  const value = Netlify.env.get(name)?.trim();
  if (!value) throw new Error(`Miljövariabeln ${name} saknas.`);
  return value;
}

async function withConnieClient<T>(callback: (client: Client) => Promise<T>) {
  const mcpUrl = new URL(requiredEnvironmentVariable("HERMES_MCP_URL"));
  const accessToken = requiredEnvironmentVariable("HERMES_MCP_ACCESS_TOKEN");
  const transport = new StreamableHTTPClientTransport(mcpUrl, {
    requestInit: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    reconnectionOptions: {
      initialReconnectionDelay: 250,
      maxReconnectionDelay: 1_000,
      reconnectionDelayGrowFactor: 1.5,
      maxRetries: 1,
    },
  });
  const client = new Client({ name: "sakfragan-netlify", version: "0.1.0" });

  await client.connect(transport, { timeout: 10_000 });
  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}

export async function analyzeWithConnie(post: ConnieSocialRequest) {
  return withConnieClient(async (client) => {
    const capabilitiesResult = await client.callTool(
      { name: "connie_social_capabilities", arguments: {} },
      undefined,
      { timeout: 10_000 },
    );
    const capabilities = capabilitiesSchema.parse(capabilitiesResult.structuredContent);
    if (!capabilities.analysis_available) {
      throw new Error("Connie Social saknar en aktiv Grok/OpenAI-kedja.");
    }

    const result = await client.callTool(
      { name: "connie_social_analyze_post", arguments: post },
      undefined,
      { timeout: 50_000 },
    );
    if (result.isError) throw new Error("Connie Social returnerade ett verktygsfel.");
    return connieSocialResultSchema.parse(result.structuredContent);
  });
}

export async function analyzeBatchWithConnie(posts: ConnieSocialRequest[]) {
  const items = z.array(connieSocialRequestSchema).min(1).max(10).parse(posts);
  return withConnieClient(async (client) => {
    const capabilitiesResult = await client.callTool(
      { name: "connie_social_capabilities", arguments: {} },
      undefined,
      { timeout: 10_000 },
    );
    const capabilities = capabilitiesSchema.parse(capabilitiesResult.structuredContent);
    if (!capabilities.analysis_available) {
      throw new Error("Connie Social saknar en aktiv Grok/OpenAI-kedja.");
    }

    const result = await client.callTool(
      { name: "connie_social_analyze_batch", arguments: { items } },
      undefined,
      { timeout: 50_000 },
    );
    if (result.isError) throw new Error("Connie Social returnerade ett batchverktygsfel.");
    return connieSocialBatchResultSchema.parse(result.structuredContent);
  });
}
