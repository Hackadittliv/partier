import assert from "node:assert/strict";
import test from "node:test";

import { parties } from "../app/data.ts";
import { detectSearchGoal, findPartySearchContext, findSearchIntent, inferTopic, partyMatchScore, searchIntents } from "../app/search.ts";

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

test("alla granskade jämförelser omfattar samtliga partier", () => {
  for (const intent of searchIntents) {
    for (const party of parties) assert.ok(intent.stances[party.id], `${intent.id} saknar ${party.id}`);
  }
});
