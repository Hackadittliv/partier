import { z } from "zod";

const httpsUrlSchema = z.url().refine((value) => new URL(value).protocol === "https:");

const xPostSchema = z.object({
  id: z.string().regex(/^[0-9]+$/),
  text: z.string(),
  author_id: z.string(),
  created_at: z.iso.datetime({ offset: true }).optional(),
  conversation_id: z.string().optional(),
  in_reply_to_user_id: z.string().optional(),
  edit_history_tweet_ids: z.array(z.string()).optional(),
  public_metrics: z.record(z.string(), z.number()).optional(),
  referenced_tweets: z.array(z.object({
    type: z.enum(["retweeted", "quoted", "replied_to"]),
    id: z.string(),
  })).optional(),
  attachments: z.object({
    media_keys: z.array(z.string()).optional(),
  }).optional(),
});

const xUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string(),
});

const xMediaSchema = z.object({
  media_key: z.string(),
  type: z.string().optional(),
  url: httpsUrlSchema.optional(),
  preview_image_url: httpsUrlSchema.optional(),
});

export const xRecentSearchResponseSchema = z.object({
  data: z.array(xPostSchema).optional().default([]),
  includes: z.object({
    users: z.array(xUserSchema).optional().default([]),
    media: z.array(xMediaSchema).optional().default([]),
  }).optional(),
  meta: z.object({
    newest_id: z.string().optional(),
    oldest_id: z.string().optional(),
    result_count: z.number().int().nonnegative().optional(),
    next_token: z.string().optional(),
  }).optional(),
  errors: z.array(z.object({
    title: z.string().optional(),
    detail: z.string().optional(),
    type: z.string().optional(),
  })).optional(),
});

export type VerifiedXAccount = {
  sourceId: string;
  partyId: string;
  partyName: string;
  handle: string;
  accountUrl: string;
  verificationUrl: string;
  automaticCollectionEnabled: boolean;
};

export type CollectedXPost = {
  party_id: string;
  platform: "x";
  external_post_id: string;
  url: string;
  author_handle: string;
  author_name: string;
  account_type: "central_party";
  account_url: string;
  verification_url: string;
  account_verified: true;
  body: string;
  published_at: string | null;
  post_type: "original" | "thread" | "quote" | "reply";
  thread_id: string | null;
  source_query: string;
  metrics: Record<string, unknown>;
  media_urls: string[];
};

function normalizedHandle(value: string) {
  return value.replace(/^@/, "").toLowerCase();
}

function comparePostIds(left: string, right: string) {
  const a = BigInt(left);
  const b = BigInt(right);
  return a < b ? -1 : a > b ? 1 : 0;
}

export function buildOfficialAccountsQuery(accounts: VerifiedXAccount[]) {
  if (accounts.length === 0) throw new Error("Inga verifierade X-konton valdes.");

  const handles = [...new Set(accounts.map((account) => normalizedHandle(account.handle)))];
  const query = `(${handles.map((handle) => `from:${handle}`).join(" OR ")}) -is:retweet`;
  if (query.length > 512) throw new Error("X-sökningen överskrider plattformens gräns på 512 tecken.");
  return query;
}

type RecentSearchUrlOptions = {
  accounts: VerifiedXAccount[];
  maxResults: number;
  sinceId?: string | null;
  startTime?: string | null;
};

export function buildRecentSearchUrl({
  accounts,
  maxResults,
  sinceId,
  startTime,
}: RecentSearchUrlOptions) {
  const url = new URL("https://api.x.com/2/tweets/search/recent");
  url.searchParams.set("query", buildOfficialAccountsQuery(accounts));
  url.searchParams.set("max_results", String(Math.max(10, Math.min(100, maxResults))));
  url.searchParams.set(
    "tweet.fields",
    "attachments,author_id,conversation_id,created_at,edit_history_tweet_ids,in_reply_to_user_id,public_metrics,referenced_tweets",
  );
  url.searchParams.set("expansions", "attachments.media_keys,author_id");
  url.searchParams.set("user.fields", "id,name,username");
  url.searchParams.set("media.fields", "media_key,preview_image_url,type,url");
  if (sinceId) url.searchParams.set("since_id", sinceId);
  else if (startTime) url.searchParams.set("start_time", startTime);
  return url;
}

function postType(post: z.infer<typeof xPostSchema>) {
  const referenceTypes = new Set(post.referenced_tweets?.map((item) => item.type) ?? []);
  if (referenceTypes.has("quoted")) return "quote" as const;
  if (referenceTypes.has("replied_to")) {
    return post.in_reply_to_user_id === post.author_id ? "thread" as const : "reply" as const;
  }
  return "original" as const;
}

export function mapRecentSearchResponse(
  response: z.infer<typeof xRecentSearchResponseSchema>,
  accounts: VerifiedXAccount[],
  sourceQuery: string,
) {
  const usersById = new Map((response.includes?.users ?? []).map((user) => [user.id, user]));
  const mediaByKey = new Map((response.includes?.media ?? []).map((media) => [media.media_key, media]));
  const accountsByHandle = new Map(
    accounts.map((account) => [normalizedHandle(account.handle), account]),
  );

  const items = response.data.flatMap<CollectedXPost>((post) => {
    if (post.referenced_tweets?.some((reference) => reference.type === "retweeted")) return [];

    const user = usersById.get(post.author_id);
    if (!user) return [];
    const account = accountsByHandle.get(normalizedHandle(user.username));
    if (!account) return [];

    const mediaUrls = (post.attachments?.media_keys ?? []).flatMap((key) => {
      const media = mediaByKey.get(key);
      const url = media?.url ?? media?.preview_image_url;
      return url ? [url] : [];
    });
    const type = postType(post);

    return [{
      party_id: account.partyId,
      platform: "x",
      external_post_id: post.id,
      url: `https://x.com/${account.handle}/status/${post.id}`,
      author_handle: account.handle,
      author_name: user.name || account.partyName,
      account_type: "central_party",
      account_url: account.accountUrl,
      verification_url: account.verificationUrl,
      account_verified: true,
      body: post.text,
      published_at: post.created_at ?? null,
      post_type: type,
      thread_id: type === "original" ? null : post.conversation_id ?? null,
      source_query: sourceQuery,
      metrics: {
        public: post.public_metrics ?? {},
        x: {
          author_id: post.author_id,
          conversation_id: post.conversation_id ?? null,
          edit_history_post_ids: post.edit_history_tweet_ids ?? [post.id],
          referenced_posts: post.referenced_tweets ?? [],
        },
      },
      media_urls: [...new Set(mediaUrls)],
    }];
  });

  items.sort((left, right) => comparePostIds(left.external_post_id, right.external_post_id));
  return items;
}

export function newestPostId(items: CollectedXPost[]) {
  return items.reduce<string | null>((newest, item) => {
    if (!newest || comparePostIds(newest, item.external_post_id) < 0) return item.external_post_id;
    return newest;
  }, null);
}

function stockholmParts(now: Date) {
  const parts = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Stockholm",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  return Object.fromEntries(parts.map((part) => [part.type, part.value]));
}

export function scheduledStockholmSlot(now: Date) {
  const parts = stockholmParts(now);
  const localDate = `${parts.year}-${parts.month}-${parts.day}`;
  const hour = Number(parts.hour);
  const pollingHours = localDate > "2026-09-13" ? [6] : [0, 6, 12, 18];
  if (!pollingHours.includes(hour)) return null;
  return `${localDate}T${String(hour).padStart(2, "0")}:00+Europe/Stockholm`;
}

export type XResourceCounts = {
  posts: number;
  users: number;
  media: number;
};

export type XResourceRates = {
  postUsd: number | null;
  userUsd: number | null;
  mediaUsd: number | null;
};

export function configuredSourceCost(counts: XResourceCounts, rates: XResourceRates) {
  if (rates.postUsd === null || rates.userUsd === null || rates.mediaUsd === null) return null;
  return Number((
    counts.posts * rates.postUsd
    + counts.users * rates.userUsd
    + counts.media * rates.mediaUsd
  ).toFixed(8));
}
