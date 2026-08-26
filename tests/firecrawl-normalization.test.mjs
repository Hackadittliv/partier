import assert from "node:assert/strict";
import test from "node:test";

import { normalizeSourceMarkdown } from "../netlify/functions/_shared/firecrawl.ts";

test("normalizes dynamic session and vote data", () => {
  const first = "[Ja](https://example.se/vote;jsessionid=ABC123?state=vote)\nTotalt antal röster: 4 066";
  const second = "[Ja](https://example.se/vote;jsessionid=DEF456?state=vote)\nTotalt antal röster: 4 105";

  assert.equal(normalizeSourceMarkdown(first), normalizeSourceMarkdown(second));
});

test("removes changing recaptcha payloads without hiding policy text", () => {
  const content = "Ett sakpolitiskt vallöfte.\n![](https://www.google.com/recaptcha/api2/payload?p=123)\nSelect all squares with motorcycles";

  assert.equal(normalizeSourceMarkdown(content), "Ett sakpolitiskt vallöfte.");
});
