import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("mobilvyn låser dokumentet till skärmens bredd", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(css, /html \{[^}]*overflow-x: clip/);
  assert.match(css, /body \{[^}]*overflow-x: clip/);
  assert.match(css, /main \{[^}]*max-width: 100%[^}]*overflow-x: clip/);
  assert.doesNotMatch(css, /\.sectionWrap \{[^}]*92vw/);
  assert.match(
    css,
    /@media \(max-width: 680px\)[\s\S]*?\.topbar nav \{[^}]*grid-template-columns: repeat\(4, minmax\(0, 1fr\)\)[^}]*overflow: hidden/,
  );
});

test("endast frågeförslagen får egen horisontell mobilrullning", async () => {
  const css = await readFile(new URL("../app/globals.css", import.meta.url), "utf8");

  assert.match(
    css,
    /@media \(max-width: 680px\)[\s\S]*?\.suggestions \{[^}]*overflow-x: auto[^}]*overscroll-behavior-x: contain[^}]*scroll-snap-type: x mandatory/,
  );
  assert.doesNotMatch(css, /\.suggestions \{[^}]*touch-action: pan-x/);
  assert.match(css, /\.suggestions button \{[^}]*flex: 0 0 100%[^}]*scroll-snap-align: start/);
  assert.match(css, /\.partyCard \{[^}]*min-width: 0[^}]*max-width: 100%/);
});
