import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const siteUrl = "https://sakfragan.nu";

test("startsidan använder den publika domänen och strukturerad data", async () => {
  const html = await readFile(new URL("../out/index.html", import.meta.url), "utf8");
  assert.match(html, /<link rel="canonical" href="https:\/\/sakfragan\.nu"/);
  assert.match(html, /<meta property="og:url" content="https:\/\/sakfragan\.nu"/);
  assert.match(html, /type="application\/ld\+json"/);
  assert.doesNotMatch(html, /codex-preview/);
  assert.doesNotMatch(html, /sakfragan\.netlify\.app/);
});

test("robots och sitemap pekar på den publika domänen", async () => {
  const [robots, sitemap] = await Promise.all([
    readFile(new URL("../out/robots.txt", import.meta.url), "utf8"),
    readFile(new URL("../out/sitemap.xml", import.meta.url), "utf8"),
  ]);
  assert.match(robots, new RegExp(`Sitemap: ${siteUrl}/sitemap\\.xml`));
  assert.match(robots, /Disallow: \/granskning/);
  assert.match(sitemap, new RegExp(`<loc>${siteUrl}/partier/moderaterna</loc>`));
  assert.match(sitemap, new RegExp(`<loc>${siteUrl}/sakfragor/energi</loc>`));
  assert.equal((sitemap.match(/<url>/g) ?? []).length, 27);
});

test("parti och sakfrågesidor har egna canonical adresser och ett huvudämne", async () => {
  const pages = [
    ["../out/partier/moderaterna.html", `${siteUrl}/partier/moderaterna`],
    ["../out/sakfragor/energi.html", `${siteUrl}/sakfragor/energi`],
  ];

  for (const [path, canonical] of pages) {
    const html = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`));
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    assert.match(html, /type="application\/ld\+json"/);
  }
});
