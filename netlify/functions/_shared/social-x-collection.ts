import type { Context } from "@netlify/functions";
import { z } from "zod";

import { postgrestQuery, SupabaseRequestError, supabaseRequest } from "./supabase";
import {
  buildOfficialAccountsQuery,
  buildRecentSearchUrl,
  configuredSourceCost,
  mapRecentSearchResponse,
  newestPostId,
  type CollectedXPost,
  type VerifiedXAccount,
  xRecentSearchResponseSchema,
} from "./x-collector";

const COLLECTOR_KEY = "official_party_x_recent_search_v1";

const registeredSourceMetadataSchema = z.object({
  status: z.literal("verified"),
  account_type: z.literal("central_party"),
  account_handle: z.string().regex(/^[A-Za-z0-9_]{1,50}$/),
  account_url: z.url(),
  verification_url: z.url(),
  automatic_collection_enabled: z.boolean().default(false),
});

type RegisteredSource = {
  id: string;
  party_id: string;
  title: string;
  canonical_url: string;
  metadata: Record<string, unknown>;
};

type Cursor = {
  collector_key: string;
  last_external_post_id: string | null;
  last_success_at: string | null;
  metadata: Record<string, unknown>;
};

type IngestRun = { id: string };

type QueueResult = {
  run_id?: string;
  status?: string;
  duplicate?: boolean;
};

export type XCollectionResult = {
  started: boolean;
  dryRun: boolean;
  collectionRunId?: string;
  collectionSlot?: string;
  accountsChecked: number;
  postsRead: number;
  usersRead: number;
  mediaRead: number;
  postsFound: number;
  postsQueued: number;
  duplicatesSkipped: number;
  failedToQueue: number;
  sourceRequests: number;
  sourceCostEstimateUsd: number | null;
  sourceCostEstimateBasis: "configured_resource_rates_before_daily_dedup" | "not_configured";
  newestExternalPostId: string | null;
  childRunIds: string[];
  message?: string;
};

type RunXCollectionOptions = {
  triggerKind: "scheduled" | "manual";
  dryRun: boolean;
  collectionSlot?: string;
  maxPosts?: number;
  now?: Date;
};

function requiredEnvironmentVariable(name: string) {
  const value = Netlify.env.get(name)?.trim();
  if (!value) throw new Error(`Miljövariabeln ${name} saknas.`);
  return value;
}

function numberEnvironmentVariable(name: string, fallback: number, min: number, max: number) {
  const raw = Netlify.env.get(name)?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    throw new Error(`Miljövariabeln ${name} måste vara ett tal mellan ${min} och ${max}.`);
  }
  return parsed;
}

function optionalResourceRate(name: string) {
  const raw = Netlify.env.get(name)?.trim();
  if (!raw) return null;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error(`Miljövariabeln ${name} måste vara ett positivt tal.`);
  }
  return parsed;
}

function configuredResourceRates() {
  return {
    postUsd: optionalResourceRate("X_API_COST_USD_PER_POST"),
    userUsd: optionalResourceRate("X_API_COST_USD_PER_USER"),
    mediaUsd: optionalResourceRate("X_API_COST_USD_PER_MEDIA"),
  };
}

async function verifiedAccounts(includeDisabled: boolean) {
  const query = postgrestQuery({
    select: "id,party_id,title,canonical_url,metadata",
    source_kind: "eq.social",
    platform: "eq.x",
    official: "eq.true",
    active: "eq.true",
    order: "party_id.asc",
    limit: "100",
  });
  const sources = await supabaseRequest<RegisteredSource[]>(`sources?${query}`);

  return sources.flatMap<VerifiedXAccount>((source) => {
    const parsed = registeredSourceMetadataSchema.safeParse(source.metadata);
    if (!parsed.success) return [];
    if (!includeDisabled && !parsed.data.automatic_collection_enabled) return [];
    if (source.canonical_url !== parsed.data.account_url) return [];

    return [{
      sourceId: source.id,
      partyId: source.party_id,
      partyName: source.title.replace(/ på X$/u, ""),
      handle: parsed.data.account_handle,
      accountUrl: parsed.data.account_url,
      verificationUrl: parsed.data.verification_url,
      automaticCollectionEnabled: parsed.data.automatic_collection_enabled,
    }];
  });
}

async function collectorCursor() {
  const query = postgrestQuery({
    select: "collector_key,last_external_post_id,last_success_at,metadata",
    collector_key: `eq.${COLLECTOR_KEY}`,
    limit: "1",
  });
  const [cursor] = await supabaseRequest<Cursor[]>(`collector_cursors?${query}`);
  return cursor ?? null;
}

async function createCollectionRun(
  options: RunXCollectionOptions,
  accountsTotal: number,
  requestedAt: string,
) {
  const details: Record<string, unknown> = {
    collector: "x_api_v2_recent_search",
    dry_run: options.dryRun,
    requested_at: requestedAt,
    automatic_collection: !options.dryRun,
  };
  if (options.collectionSlot) details.collection_slot = options.collectionSlot;

  try {
    const [run] = await supabaseRequest<IngestRun[]>("ingest_runs", {
      method: "POST",
      prefer: "return=representation",
      body: {
        trigger_kind: options.triggerKind,
        status: "running",
        sources_total: accountsTotal,
        details,
      },
    });
    if (!run) throw new Error("Kunde inte skapa en körningslogg för X-kollektorn.");
    return run;
  } catch (error) {
    if (options.collectionSlot && error instanceof SupabaseRequestError && error.status === 409) {
      return null;
    }
    throw error;
  }
}

async function updateRun(runId: string, body: Record<string, unknown>) {
  const query = postgrestQuery({ id: `eq.${runId}` });
  await supabaseRequest(`ingest_runs?${query}`, {
    method: "PATCH",
    prefer: "return=minimal",
    body,
  });
}

async function updateCursor(
  lastExternalPostId: string,
  runId: string,
  completedAt: string,
  metadata: Record<string, unknown>,
) {
  const query = postgrestQuery({ on_conflict: "collector_key" });
  await supabaseRequest(`collector_cursors?${query}`, {
    method: "POST",
    prefer: "resolution=merge-duplicates,return=minimal",
    body: {
      collector_key: COLLECTOR_KEY,
      platform: "x",
      last_external_post_id: lastExternalPostId,
      last_success_at: completedAt,
      last_run_id: runId,
      metadata,
    },
  });
}

async function markSourcesSucceeded(accounts: VerifiedXAccount[], completedAt: string) {
  await Promise.all(accounts.map((account) => {
    const query = postgrestQuery({ id: `eq.${account.sourceId}` });
    return supabaseRequest(`sources?${query}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        last_checked_at: completedAt,
        last_success_at: completedAt,
        last_status_code: 200,
        consecutive_failures: 0,
      },
    });
  }));
}

async function queueForConnie(
  context: Context,
  item: CollectedXPost,
  webhookSecret: string,
) {
  const endpoint = new URL("/api/connie/social", context.site.url);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${webhookSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(item),
    signal: AbortSignal.timeout(15_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Connie-mottagaren svarade med ${response.status}: ${responseText.slice(0, 300)}`);
  }
  return JSON.parse(responseText) as QueueResult;
}

async function queueWithConcurrency(
  context: Context,
  items: CollectedXPost[],
  webhookSecret: string,
) {
  const childRunIds: string[] = [];
  let postsQueued = 0;
  let duplicatesSkipped = 0;
  let failedToQueue = 0;
  const queue = [...items];

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      if (!item) return;
      try {
        const result = await queueForConnie(context, item, webhookSecret);
        if (result.run_id) childRunIds.push(result.run_id);
        if (result.duplicate || result.status === "duplicate") duplicatesSkipped += 1;
        else postsQueued += 1;
      } catch (error) {
        failedToQueue += 1;
        console.error(
          "Kunde inte köa verifierat X-inlägg",
          item.external_post_id,
          error instanceof Error ? error.message : error,
        );
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(3, items.length) }, () => worker()));
  return { childRunIds, postsQueued, duplicatesSkipped, failedToQueue };
}

function runDetails(
  options: RunXCollectionOptions,
  result: Omit<XCollectionResult, "started" | "dryRun" | "collectionRunId">,
  query: string,
) {
  return {
    collector: "x_api_v2_recent_search",
    dry_run: options.dryRun,
    automatic_collection: !options.dryRun,
    collection_slot: options.collectionSlot,
    source_query: query,
    accounts_checked: result.accountsChecked,
    posts_read: result.postsRead,
    posts_found: result.postsFound,
    posts_queued: result.postsQueued,
    duplicates_skipped: result.duplicatesSkipped,
    failed_to_queue: result.failedToQueue,
    source_usage: {
      provider: "x_api_v2",
      requests: result.sourceRequests,
      resources_read: {
        posts: result.postsRead,
        users: result.usersRead,
        media: result.mediaRead,
      },
      estimated_cost_usd: result.sourceCostEstimateUsd,
      estimate_basis: result.sourceCostEstimateBasis,
      actual_cost_source: "x_developer_console",
    },
    newest_external_post_id: result.newestExternalPostId,
    child_run_ids: result.childRunIds,
  };
}

export async function runXCollection(
  context: Context,
  options: RunXCollectionOptions,
): Promise<XCollectionResult> {
  const now = options.now ?? new Date();
  const requestedAt = now.toISOString();
  const accounts = await verifiedAccounts(options.dryRun);
  if (accounts.length === 0) {
    return {
      started: false,
      dryRun: options.dryRun,
      collectionSlot: options.collectionSlot,
      accountsChecked: 0,
      postsRead: 0,
      usersRead: 0,
      mediaRead: 0,
      postsFound: 0,
      postsQueued: 0,
      duplicatesSkipped: 0,
      failedToQueue: 0,
      sourceRequests: 0,
      sourceCostEstimateUsd: null,
      sourceCostEstimateBasis: "not_configured",
      newestExternalPostId: null,
      childRunIds: [],
      message: options.dryRun
        ? "Inga verifierade X-konton hittades."
        : "Automatisk insamling är inte aktiverad för något verifierat X-konto.",
    };
  }

  const run = await createCollectionRun(options, accounts.length, requestedAt);
  if (!run) {
    return {
      started: false,
      dryRun: options.dryRun,
      collectionSlot: options.collectionSlot,
      accountsChecked: accounts.length,
      postsRead: 0,
      usersRead: 0,
      mediaRead: 0,
      postsFound: 0,
      postsQueued: 0,
      duplicatesSkipped: 0,
      failedToQueue: 0,
      sourceRequests: 0,
      sourceCostEstimateUsd: null,
      sourceCostEstimateBasis: "not_configured",
      newestExternalPostId: null,
      childRunIds: [],
      message: "Den här schemaplatsen är redan hämtad eller pågår.",
    };
  }

  try {
    const bearerToken = requiredEnvironmentVariable("X_API_BEARER_TOKEN");
    const cursor = await collectorCursor();
    const lookbackHours = numberEnvironmentVariable("X_API_INITIAL_LOOKBACK_HOURS", 6, 1, 168);
    const hardLimit = numberEnvironmentVariable("CONNIE_SOCIAL_X_MAX_POSTS_PER_RUN", 20, 1, 100);
    const requestedLimit = Math.max(1, Math.min(options.maxPosts ?? hardLimit, hardLimit));
    const startTime = cursor?.last_external_post_id
      ? null
      : new Date(now.getTime() - lookbackHours * 60 * 60 * 1_000).toISOString();
    const url = buildRecentSearchUrl({
      accounts,
      maxResults: requestedLimit,
      sinceId: cursor?.last_external_post_id,
      startTime,
    });
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
      signal: AbortSignal.timeout(20_000),
    });
    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`X API svarade med ${response.status}: ${responseText.slice(0, 500)}`);
    }

    const parsed = xRecentSearchResponseSchema.parse(JSON.parse(responseText));
    if (parsed.errors?.length && parsed.data.length === 0) {
      throw new Error(`X API returnerade inga användbara poster: ${parsed.errors[0]?.detail ?? "okänt fel"}`);
    }

    const sourceQuery = buildOfficialAccountsQuery(accounts);
    const items = mapRecentSearchResponse(parsed, accounts, sourceQuery).slice(0, requestedLimit);
    const latestId = newestPostId(items);
    const postsRead = parsed.meta?.result_count ?? parsed.data.length;
    const usersRead = parsed.includes?.users.length ?? 0;
    const mediaRead = parsed.includes?.media.length ?? 0;
    const resourceRates = configuredResourceRates();
    const sourceCostEstimateUsd = configuredSourceCost({
      posts: postsRead,
      users: usersRead,
      media: mediaRead,
    }, resourceRates);
    const queued = options.dryRun
      ? { childRunIds: [], postsQueued: 0, duplicatesSkipped: 0, failedToQueue: 0 }
      : await queueWithConcurrency(
        context,
        items,
        requiredEnvironmentVariable("CONNIE_WEBHOOK_SECRET"),
      );
    const completedAt = new Date().toISOString();
    const result = {
      accountsChecked: accounts.length,
      postsRead,
      usersRead,
      mediaRead,
      postsFound: items.length,
      postsQueued: queued.postsQueued,
      duplicatesSkipped: queued.duplicatesSkipped,
      failedToQueue: queued.failedToQueue,
      sourceRequests: 1,
      sourceCostEstimateUsd,
      sourceCostEstimateBasis: sourceCostEstimateUsd === null
        ? "not_configured" as const
        : "configured_resource_rates_before_daily_dedup" as const,
      newestExternalPostId: latestId,
      childRunIds: queued.childRunIds,
    };

    if (!options.dryRun && queued.failedToQueue === 0 && latestId) {
      await updateCursor(latestId, run.id, completedAt, {
        source_query: sourceQuery,
        accounts_checked: accounts.length,
        last_posts_read: postsRead,
      });
      await markSourcesSucceeded(accounts, completedAt);
    }

    await updateRun(run.id, {
      status: queued.failedToQueue === 0 ? "succeeded" : "partial",
      finished_at: completedAt,
      sources_succeeded: queued.failedToQueue === 0 ? accounts.length : 0,
      sources_changed: queued.postsQueued,
      error_count: queued.failedToQueue,
      details: runDetails(options, result, sourceQuery),
    });

    return {
      started: true,
      dryRun: options.dryRun,
      collectionRunId: run.id,
      collectionSlot: options.collectionSlot,
      ...result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Okänt fel";
    await updateRun(run.id, {
      status: "failed",
      finished_at: new Date().toISOString(),
      error_count: 1,
      details: {
        collector: "x_api_v2_recent_search",
        dry_run: options.dryRun,
        collection_slot: options.collectionSlot,
        error: message.slice(0, 1_000),
      },
    }).catch(() => undefined);
    throw error;
  }
}
