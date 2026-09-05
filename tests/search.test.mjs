import assert from "node:assert/strict";
import test from "node:test";

import { parties, partiesByFounded } from "../app/data.ts";
import { detectSearchGoal, findMentionedPartyIds, findPartySearchContext, findSearchConcept, findSearchIntent, getSearchSuggestions, inferTopic, partyMatchScore, queryWords, searchIntents, searchTokenKind } from "../app/search.ts";

test("tolkar tydliga politiska frågor", () => {
  assert.equal(findSearchIntent("Vilka vill bygga mer kärnkraft?")?.intent.id, "new-nuclear");
  assert.equal(findSearchIntent("Vilka vill stoppa vinster i skolan?")?.intent.id, "stop-school-profits");
  assert.equal(findSearchIntent("Vilka vill lämna EU?")?.intent.id, "leave-eu");
});

test("hanterar ett vanligt stavfel", () => {
  assert.equal(findSearchIntent("Vilka partier vill bygga kärnkraf?")?.intent.id, "new-nuclear");
});

test("identifierar ett bredare sakområde", () => {
  assert.equal(inferTopic("Vad vill partierna göra åt ungdomsbrottsligheten?"), "brott");
  assert.equal(findSearchIntent("Vad vill Moderaterna göra med skolan?"), null);
  assert.equal(inferTopic("Vad vill Moderaterna göra med skolan?"), "skola");
});

test("skiljer stödjande och avvisande frågor", () => {
  const intent = searchIntents.find((item) => item.id === "new-nuclear");
  assert.ok(intent);
  assert.equal(detectSearchGoal("Vilka vill bygga ny kärnkraft?", intent), "support");
  assert.equal(detectSearchGoal("Vilka vill stoppa kärnkraft?", intent), "oppose");
});

test("ger partinamn hög vikt även i en hel fråga", () => {
  const moderaterna = parties.find((party) => party.id === "moderaterna");
  const centerpartiet = parties.find((party) => party.id === "centerpartiet");
  assert.ok(moderaterna);
  assert.ok(centerpartiet);
  const query = "Vad vill Moderaterna göra med skolan?";
  assert.ok(partyMatchScore(moderaterna, query, "skola", "skola") > partyMatchScore(centerpartiet, query, "skola", "skola"));
});

test("visar sammanhanget bakom en bred textträff", () => {
  const medborgerligSamling = parties.find((party) => party.id === "medborgerligsamling");
  assert.ok(medborgerligSamling);
  const context = findPartySearchContext(medborgerligSamling, "kommunalt", "alla");
  assert.equal(context?.topic, "energi");
  assert.match(context?.text ?? "", /Kommunalt veto/);
});

test("skiljer direkta AI träffar från närliggande digital politik", () => {
  const mod = parties.find((party) => party.id === "partietmod");
  const centerpartiet = parties.find((party) => party.id === "centerpartiet");
  const piratpartiet = parties.find((party) => party.id === "piratpartiet");
  assert.ok(mod && centerpartiet && piratpartiet);
  assert.equal(findSearchConcept("Vad säger partierna om AI?")?.id, "ai");
  assert.equal(findPartySearchContext(mod, "AI", "alla")?.kind, "direct");
  assert.match(findPartySearchContext(mod, "AI", "alla")?.text ?? "", /AI/);
  assert.equal(findPartySearchContext(centerpartiet, "AI", "alla")?.kind, "direct");
  assert.match(findPartySearchContext(centerpartiet, "AI", "alla")?.text ?? "", /AI forskare/);
  assert.equal(findPartySearchContext(piratpartiet, "AI", "alla")?.kind, "related");
  assert.match(findPartySearchContext(piratpartiet, "AI", "alla")?.text ?? "", /digitalisering/);
});

test("förstår utskrivet AI begrepp och ger ett relevant frågeförslag", () => {
  const mod = parties.find((party) => party.id === "partietmod");
  assert.ok(mod);
  assert.equal(findPartySearchContext(mod, "artificiell intelligens", "alla")?.kind, "direct");
  assert.equal(getSearchSuggestions("artificiell intelligens", 1)[0], "Vad säger partierna om AI och digitalisering?");
});

test("låter bostadsbegreppet styra framför vanliga småord", () => {
  const query = "Hur skall man få ut unga på bostadsmarknaden";
  const alternativForSverige = parties.find((party) => party.id === "alternativforsverige");
  const kristdemokraterna = parties.find((party) => party.id === "kristdemokraterna");
  const nyans = parties.find((party) => party.id === "nyans");
  assert.ok(alternativForSverige && kristdemokraterna && nyans);

  assert.deepEqual(queryWords(query), ["unga", "bostadsmarknaden"]);
  assert.equal(findSearchConcept(query)?.id, "housing");
  assert.deepEqual(
    parties.filter((party) => findPartySearchContext(party, query, "alla")).map((party) => party.id),
    ["kristdemokraterna", "socialdemokraterna", "vansterpartiet", "nyans"],
  );
  assert.equal(findPartySearchContext(alternativForSverige, query, "alla"), null);
  assert.equal(findPartySearchContext(kristdemokraterna, query, "alla")?.kind, "related");
  const nyansContext = findPartySearchContext(nyans, query, "alla");
  assert.equal(nyansContext?.kind, "direct");
  assert.equal(searchTokenKind("få", nyansContext), null);
});

test("skiljer pronomenet man från substantivet män", () => {
  assert.deepEqual(queryWords("Hur skall man förbättra demokratin?"), ["forbattra", "demokratin"]);
  assert.deepEqual(queryWords("Vad säger partierna om män?"), ["män"]);
});

test("avgränsar en fråga som nämner ett eller flera partier", () => {
  assert.deepEqual(findMentionedPartyIds("Vad vill Moderaterna göra med skolan?"), ["moderaterna"]);
  assert.deepEqual(findMentionedPartyIds("Jämför M och S om skolan"), ["moderaterna", "socialdemokraterna"]);
  assert.deepEqual(findMentionedPartyIds("Vad vill partierna göra med skolan?"), []);
});

test("alla granskade jämförelser omfattar samtliga partier", () => {
  for (const intent of searchIntents) {
    for (const party of parties) assert.ok(intent.stances[party.id], `${intent.id} saknar ${party.id}`);
  }
});

test("visar samtliga partier från äldst till yngst", () => {
  assert.deepEqual(
    partiesByFounded.map((party) => [party.id, party.founded]),
    [
      ["socialdemokraterna", 1889],
      ["moderaterna", 1904],
      ["centerpartiet", 1910],
      ["vansterpartiet", 1917],
      ["liberalerna", 1934],
      ["kristdemokraterna", 1964],
      ["miljopartiet", 1981],
      ["sverigedemokraterna", 1988],
      ["piratpartiet", 2006],
      ["medborgerligsamling", 2014],
      ["orebropartiet", 2014],
      ["alternativforsverige", 2018],
      ["nyans", 2019],
      ["partietmod", 2021],
    ],
  );
});
