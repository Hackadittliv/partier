import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("den dagliga källkontrollen kör utan en tyst miljöflagga", async () => {
  const source = await readFile(
    new URL("../netlify/functions/daily-source-check.ts", import.meta.url),
    "utf8",
  );

  assert.match(source, /runSourceCheck\(context, \{ triggerKind: "scheduled" \}\)/);
  assert.match(source, /schedule: "15 2 \* \* \*"/);
  assert.doesNotMatch(source, /SAKFRAGAN_AUTOMATION_ENABLED/);
});
