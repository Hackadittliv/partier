import assert from "node:assert/strict";
import test from "node:test";

import {
  buildOfficialAccountsQuery,
  buildRecentSearchUrl,
  configuredSourceCost,
  mapRecentSearchResponse,
  newestPostId,
  scheduledStockholmSlot,
  xRecentSearchResponseSchema,
} from "../netlify/functions/_shared/x-collector.ts";

const accounts = [
  {
    sourceId: "source-s",
    partyId: "socialdemokraterna",
    partyName: "Socialdemokraterna",
    handle: "socialdemokrat",
    accountUrl: "https://x.com/socialdemokrat",
    verificationUrl: "https://www.socialdemokraterna.se/",
    automaticCollectionEnabled: false,
  },
  {
    sourceId: "source-m",
    partyId: "moderaterna",
    partyName: "Moderaterna",
    handle: "moderaterna",
    accountUrl: "https://x.com/moderaterna",
    verificationUrl: "https://moderaterna.se/",
    automaticCollectionEnabled: false,
  },
];

test("bygger en begränsad officiell sökning utan rena delningar", () => {
  const query = buildOfficialAccountsQuery(accounts);
  assert.equal(query, "(from:socialdemokrat OR from:moderaterna) -is:retweet");
  assert.ok(query.length <= 512);

  const url = buildRecentSearchUrl({
    accounts,
    maxResults: 20,
    sinceId: "1234567890",
    startTime: "2026-08-25T00:00:00.000Z",
  });
  assert.equal(url.origin, "https://api.x.com");
  assert.equal(url.pathname, "/2/tweets/search/recent");
  assert.equal(url.searchParams.get("since_id"), "1234567890");
  assert.equal(url.searchParams.has("start_time"), false);
  assert.equal(url.searchParams.get("max_results"), "20");
});

test("mappar endast registrerade kontoägare och bevarar originaltext", () => {
  const parsed = xRecentSearchResponseSchema.parse({
    data: [
      {
        id: "102",
        text: "Exakt originaltext med åäö.",
        author_id: "user-s",
        created_at: "2026-08-25T10:00:00.000Z",
        conversation_id: "99",
        in_reply_to_user_id: "user-other",
        edit_history_tweet_ids: ["101", "102"],
        public_metrics: { like_count: 5 },
        referenced_tweets: [{ type: "replied_to", id: "99" }],
        attachments: { media_keys: ["media-1"] },
      },
      {
        id: "100",
        text: "Ett citerande original.",
        author_id: "user-m",
        conversation_id: "100",
        referenced_tweets: [{ type: "quoted", id: "80" }],
      },
      {
        id: "103",
        text: "En ren delning.",
        author_id: "user-s",
        referenced_tweets: [{ type: "retweeted", id: "77" }],
      },
      {
        id: "104",
        text: "Kommer från ett konto utanför registret.",
        author_id: "user-unknown",
      },
    ],
    includes: {
      users: [
        { id: "user-s", name: "Socialdemokraterna", username: "socialdemokrat" },
        { id: "user-m", name: "Moderaterna", username: "Moderaterna" },
        { id: "user-unknown", name: "Okänd", username: "unknown" },
      ],
      media: [
        { media_key: "media-1", type: "photo", url: "https://pbs.twimg.com/media/test.jpg" },
      ],
    },
    meta: { result_count: 4 },
  });

  const items = mapRecentSearchResponse(parsed, accounts, "verifierad query");
  assert.equal(items.length, 2);
  assert.deepEqual(items.map((item) => item.external_post_id), ["100", "102"]);
  assert.equal(items[0].post_type, "quote");
  assert.equal(items[1].post_type, "reply");
  assert.equal(items[1].body, "Exakt originaltext med åäö.");
  assert.equal(items[1].raw_evidence, undefined);
  assert.deepEqual(items[1].media_urls, ["https://pbs.twimg.com/media/test.jpg"]);
  assert.deepEqual(items[1].metrics.x.edit_history_post_ids, ["101", "102"]);
  assert.equal(newestPostId(items), "102");
});

test("schemalägger enligt svensk tid och går ned till en gång per dygn efter valet", () => {
  assert.equal(
    scheduledStockholmSlot(new Date("2026-08-24T22:05:00.000Z")),
    "2026-08-25T00:00+Europe/Stockholm",
  );
  assert.equal(scheduledStockholmSlot(new Date("2026-08-25T00:05:00.000Z")), null);
  assert.equal(
    scheduledStockholmSlot(new Date("2026-09-14T04:05:00.000Z")),
    "2026-09-14T06:00+Europe/Stockholm",
  );
  assert.equal(scheduledStockholmSlot(new Date("2026-09-14T10:05:00.000Z")), null);
});

test("rapporterar bara källkostnad när en aktuell enhetskostnad är konfigurerad", () => {
  const resources = { posts: 14, users: 3, media: 2 };
  assert.equal(configuredSourceCost(resources, {
    postUsd: null,
    userUsd: 0.01,
    mediaUsd: 0.005,
  }), null);
  assert.equal(configuredSourceCost(resources, {
    postUsd: 0.005,
    userUsd: 0.01,
    mediaUsd: 0.005,
  }), 0.11);
});
