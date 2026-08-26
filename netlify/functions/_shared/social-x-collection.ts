import type { Context } from "@netlify/functions";
import { z } from "zod";

import { postgrestQuery, SupabaseRequestError, supabaseRequest } from "./supabase";
import {
  buildOfficialAccountsQuery,
  buildRecentSearchUrl,
  buildUsersByUsernameUrl,
  configuredSourceCost,
  isLikelyRelevantSocialPost,
  mapRecentSearchResponse,
  newestPostId,
  resolvedAccountUserIds,
  type CollectedXPost,
  type VerifiedXAccount,
  xRecentSearchResponseSchema,
  xUsersByUsernameResponseSchema,
} from "./x-collector";

const COLLECTOR_KEY = "official_party_x_recent_search_v1";

const registeredSourceMetadataSchema = z.object({
  status: z.literal("verified"),
  account_type: z.literal("central_party"),
  account_handle: z.string().regex(/^[A-Za-z0-9_]{1,50}$/),
  account_url: z.url(),
  verification_url: z.url(),
  automatic_collection_enabled: z.boolean().default(false),
  x_user_id: z.string().regex(/^[0-9]+$/).optional(),
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
  accepted_items?: number;
  duplicate_items?: number;
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
  postsFilteredByCode: number;
  postsQueued: number;
  duplicatesSkipped: number;
  failedToQueue: number;
  sourceRequests: number;
  analysisBatches: number;
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

async function resolveAccountUserIds(accounts: VerifiedXAccount[], bearerToken: string) {
  const unresolved = accounts.filter((account) => !account.userId);
  if (unresolved.length === 0) return { accounts, usersRead: 0, sourceRequests: 0 };

  const response = await fetch(buildUsersByUsernameUrl(unresolved), {
    headers: { Authorization: `Bearer ${bearerToken}` },
    signal: AbortSignal.timeout(20_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`X användarregister svarade med ${response.status}: ${responseText.slice(0, 500)}`);
  }
  const parsed = xUsersByUsernameResponseSchema.parse(JSON.parse(responseText));
  const resolved = resolvedAccountUserIds(parsed, unresolved);
  if (resolved.length !== unresolved.length) {
    const resolvedSourceIds = new Set(resolved.map(({ account }) => account.sourceId));
    const missing = unresolved.filter((account) => !resolvedSourceIds.has(account.sourceId));
    throw new Error(`X kunde inte verifiera konto-ID för: ${missing.map((account) => account.handle).join(", ")}`);
  }

  const userIdBySource = new Map(resolved.map(({ account, user }) => [account.sourceId, user.id]));
  await Promise.all(resolved.map(({ account, user }) => {
    const query = postgrestQuery({ id: `eq.${account.sourceId}` });
    return supabaseRequest(`sources?${query}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: {
        metadata: {
          ...account.sourceMetadata,
          x_user_id: user.id,
          x_resolved_name: user.name,
          x_user_id_verified_at: new Date().toISOString(),
        },
      },
    });
  }));

  return {
    accounts: accounts.map((account) => ({
      ...account,
      userId: account.userId ?? userIdBySource.get(account.sourceId) ?? null,
    })),
    usersRead: parsed.data.length,
    sourceRequests: 1,
  };
}

type UsageRun = { details: Record<string, unknown> };

function numericDetail(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function xUsageToday(now: Date) {
  const start = new Date(now);
  start.setUTCHours(0, 0, 0, 0);
  const query = postgrestQuery({
    select: "details",
    started_at: `gte.${start.toISOString()}`,
    order: "started_at.desc",
    limit: "100",
  });
  const runs = await supabaseRequest<UsageRun[]>(`ingest_runs?${query}`);
  return runs.reduce((total, run) => {
    const usage = run.details.source_usage;
    if (!usage || typeof usage !== "object") return total;
    const record = usage as Record<string, unknown>;
    if (record.provider !== "x_api_v2") return total;
    const resources = record.resources_read;
    const counts = resources && typeof resources === "object"
      ? resources as Record<string, unknown>
      : {};
    return {
      posts: total.posts + numericDetail(counts.posts),
      estimatedCostUsd: total.estimatedCostUsd + numericDetail(record.estimated_cost_usd),
    };
  }, { posts: 0, estimatedCostUsd: 0 });
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
      userId: parsed.data.x_user_id ?? null,
      sourceMetadata: source.metadata,
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

async function queueBatchForConnie(
  context: Context,
  items: CollectedXPost[],
  webhookSecret: string,
) {
  const endpoint = new URL("/api/connie/social/batch", context.site.url);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${webhookSecret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ items }),
    signal: AbortSignal.timeout(15_000),
  });
  const responseText = await response.text();
  if (!response.ok) {
    throw new Error(`Connie-mottagaren svarade med ${response.status}: ${responseText.slice(0, 300)}`);
  }
  return JSON.parse(responseText) as QueueResult;
}

async function queueInBatches(
  context: Context,
  items: CollectedXPost[],
  webhookSecret: string,
  batchSize: number,
) {
  const childRunIds: string[] = [];
  let postsQueued = 0;
  let duplicatesSkipped = 0;
  let failedToQueue = 0;
  let analysisBatches = 0;

  for (let index = 0; index < items.length; index += batchSize) {
    const batch = items.slice(index, index + batchSize);
    try {
      const result = await queueBatchForConnie(context, batch, webhookSecret);
      analysisBatches += 1;
      if (result.run_id) childRunIds.push(result.run_id);
      postsQueued += result.accepted_items ?? (result.status === "duplicate" ? 0 : batch.length);
      duplicatesSkipped += result.duplicate_items ?? (result.status === "duplicate" ? batch.length : 0);
    } catch (error) {
      failedToQueue += batch.length;
      console.error(
        "Kunde inte köa verifierad X-batch",
        batch.map((item) => item.external_post_id).join(","),
        error instanceof Error ? error.message : error,
      );
    }
  }
  return { childRunIds, postsQueued, duplicatesSkipped, failedToQueue, analysisBatches };
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
    posts_filtered_by_code: result.postsFilteredByCode,
    posts_queued: result.postsQueued,
    analysis_batches: result.analysisBatches,
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
  let chargedSourceUsage: Record<string, unknown> | null = null;
  const registeredAccounts = await verifiedAccounts(options.dryRun);
  if (registeredAccounts.length === 0) {
    return {
      started: false,
      dryRun: options.dryRun,
      collectionSlot: options.collectionSlot,
      accountsChecked: 0,
      postsRead: 0,
      usersRead: 0,
      mediaRead: 0,
      postsFound: 0,
      postsFilteredByCode: 0,
      postsQueued: 0,
      duplicatesSkipped: 0,
      failedToQueue: 0,
      sourceRequests: 0,
      analysisBatches: 0,
      sourceCostEstimateUsd: null,
      sourceCostEstimateBasis: "not_configured",
      newestExternalPostId: null,
      childRunIds: [],
      message: options.dryRun
        ? "Inga verifierade X-konton hittades."
        : "Automatisk insamling är inte aktiverad för något verifierat X-konto.",
    };
  }

  const run = await createCollectionRun(options, registeredAccounts.length, requestedAt);
  if (!run) {
    return {
      started: false,
      dryRun: options.dryRun,
      collectionSlot: options.collectionSlot,
      accountsChecked: registeredAccounts.length,
      postsRead: 0,
      usersRead: 0,
      mediaRead: 0,
      postsFound: 0,
      postsFilteredByCode: 0,
      postsQueued: 0,
      duplicatesSkipped: 0,
      failedToQueue: 0,
      sourceRequests: 0,
      analysisBatches: 0,
      sourceCostEstimateUsd: null,
      sourceCostEstimateBasis: "not_configured",
      newestExternalPostId: null,
      childRunIds: [],
      message: "Den här schemaplatsen är redan hämtad eller pågår.",
    };
  }

  try {
    const bearerToken = requiredEnvironmentVariable("X_API_BEARER_TOKEN");
    const dailyPostLimit = numberEnvironmentVariable("CONNIE_SOCIAL_X_MAX_POSTS_PER_DAY", 200, 10, 10_000);
    const dailyUsdBudget = numberEnvironmentVariable("CONNIE_SOCIAL_X_DAILY_BUDGET_USD", 1, 0.01, 1_000);
    const priorUsage = await xUsageToday(now);
    const remainingDailyPosts = dailyPostLimit - priorUsage.posts;
    const resourceRates = configuredResourceRates();
    const unresolvedAccountCount = registeredAccounts.filter((account) => !account.userId).length;
    const allResourceRatesConfigured = resourceRates.postUsd !== null
      && resourceRates.userUsd !== null
      && resourceRates.mediaUsd !== null;
    const accountLookupCostUsd = allResourceRatesConfigured
      ? unresolvedAccountCount * resourceRates.userUsd!
      : 0;
    const remainingUsdAfterLookup = dailyUsdBudget
      - priorUsage.estimatedCostUsd
      - accountLookupCostUsd;
    const affordablePosts = allResourceRatesConfigured && resourceRates.postUsd! > 0
      ? Math.floor(Math.max(0, remainingUsdAfterLookup) / resourceRates.postUsd!)
      : remainingDailyPosts;
    const usdBudgetReached = resourceRates.postUsd !== null
      && (priorUsage.estimatedCostUsd >= dailyUsdBudget || affordablePosts < 10);
    if (remainingDailyPosts < 10 || usdBudgetReached) {
      const message = usdBudgetReached
        ? "Dagens X-budget i USD är förbrukad."
        : "Dagens X-budget för lästa inlägg är förbrukad.";
      await updateRun(run.id, {
        status: "succeeded",
        finished_at: new Date().toISOString(),
        details: {
          collector: "x_api_v2_recent_search",
          budget_blocked: true,
          message,
          daily_post_limit: dailyPostLimit,
          daily_usd_budget: dailyUsdBudget,
          posts_read_today: priorUsage.posts,
          estimated_cost_usd_today: priorUsage.estimatedCostUsd,
          estimated_account_lookup_cost_usd: accountLookupCostUsd,
          affordable_posts_before_request: affordablePosts,
        },
      });
      return {
        started: false,
        dryRun: options.dryRun,
        collectionRunId: run.id,
        collectionSlot: options.collectionSlot,
        accountsChecked: registeredAccounts.length,
        postsRead: 0,
        usersRead: 0,
        mediaRead: 0,
        postsFound: 0,
        postsFilteredByCode: 0,
        postsQueued: 0,
        duplicatesSkipped: 0,
        failedToQueue: 0,
        sourceRequests: 0,
        analysisBatches: 0,
        sourceCostEstimateUsd: 0,
        sourceCostEstimateBasis: resourceRates.postUsd === null
          ? "not_configured"
          : "configured_resource_rates_before_daily_dedup",
        newestExternalPostId: null,
        childRunIds: [],
        message,
      };
    }

    const resolved = await resolveAccountUserIds(registeredAccounts, bearerToken);
    const accounts = resolved.accounts;
    const cursor = await collectorCursor();
    const lookbackHours = numberEnvironmentVariable("X_API_INITIAL_LOOKBACK_HOURS", 6, 1, 168);
    const hardLimit = numberEnvironmentVariable("CONNIE_SOCIAL_X_MAX_POSTS_PER_RUN", 20, 1, 100);
    const requestedLimit = Math.max(10, Math.min(
      options.maxPosts ?? hardLimit,
      hardLimit,
      remainingDailyPosts,
      affordablePosts,
    ));
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
    const collectedItems = mapRecentSearchResponse(parsed, accounts, sourceQuery).slice(0, requestedLimit);
    const items = collectedItems.filter(isLikelyRelevantSocialPost);
    const postsFilteredByCode = collectedItems.length - items.length;
    const latestId = newestPostId(collectedItems);
    const postsRead = parsed.meta?.result_count ?? parsed.data.length;
    const usersRead = resolved.usersRead;
    const mediaRead = 0;
    const sourceCostEstimateUsd = configuredSourceCost({
      posts: postsRead,
      users: usersRead,
      media: mediaRead,
    }, resourceRates);
    chargedSourceUsage = {
      provider: "x_api_v2",
      requests: 1 + resolved.sourceRequests,
      resources_read: { posts: postsRead, users: usersRead, media: mediaRead },
      estimated_cost_usd: sourceCostEstimateUsd,
      estimate_basis: sourceCostEstimateUsd === null
        ? "not_configured"
        : "configured_resource_rates_before_daily_dedup",
      actual_cost_source: "x_developer_console",
    };
    const batchSize = numberEnvironmentVariable("CONNIE_SOCIAL_AI_BATCH_SIZE", 8, 2, 10);
    const queued = options.dryRun
      ? { childRunIds: [], postsQueued: 0, duplicatesSkipped: 0, failedToQueue: 0, analysisBatches: 0 }
      : await queueInBatches(
        context,
        items,
        requiredEnvironmentVariable("CONNIE_WEBHOOK_SECRET"),
        batchSize,
      );
    const completedAt = new Date().toISOString();
    const result = {
      accountsChecked: accounts.length,
      postsRead,
      usersRead,
      mediaRead,
      postsFound: items.length,
      postsFilteredByCode,
      postsQueued: queued.postsQueued,
      duplicatesSkipped: queued.duplicatesSkipped,
      failedToQueue: queued.failedToQueue,
      sourceRequests: 1 + resolved.sourceRequests,
      analysisBatches: queued.analysisBatches,
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
        daily_post_limit: dailyPostLimit,
        daily_usd_budget: dailyUsdBudget,
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
        ...(chargedSourceUsage ? { source_usage: chargedSourceUsage } : {}),
      },
    }).catch(() => undefined);
    throw error;
  }
}
