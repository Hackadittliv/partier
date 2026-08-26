import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSourceMarkdown } from "../netlify/functions/_shared/firecrawl.ts";
import { isPdfSourceUrl, nextSourceCheckAt } from "../netlify/functions/_shared/source-routing.ts";

test("normalizes dynamic session and vote data", () => {
  const first = "[Ja](https://example.se/vote;jsessionid=ABC123?state=vote)\nTotalt antal röster: 4 066";
  const second = "[Ja](https://example.se/vote;jsessionid=DEF456?state=vote)\nTotalt antal röster: 4 105";

  assert.equal(normalizeSourceMarkdown(first), normalizeSourceMarkdown(second));
});

test("removes changing recaptcha payloads without hiding policy text", () => {
  const content = "Ett sakpolitiskt vallöfte.\n![](https://www.google.com/recaptcha/api2/payload?p=123)\nSelect all squares with motorcycles";

  assert.equal(normalizeSourceMarkdown(content), "Ett sakpolitiskt vallöfte.");
});

test("separates PDF documents from ordinary web pages", () => {
  assert.equal(isPdfSourceUrl("https://example.se/valmanifest-2026.pdf"), true);
  assert.equal(isPdfSourceUrl("https://example.se/valmanifest-2026.PDF?download=1"), true);
  assert.equal(isPdfSourceUrl("https://example.se/valmanifest-2026/"), false);
});

test("respects daily and weekly source frequencies", () => {
  const checkedAt = new Date("2026-08-26T02:15:00.000Z");
  assert.equal(nextSourceCheckAt("daily", checkedAt), "2026-08-27T02:15:00.000Z");
  assert.equal(nextSourceCheckAt("weekly", checkedAt), "2026-09-02T02:15:00.000Z");
  assert.equal(nextSourceCheckAt("manual", checkedAt), null);
});
