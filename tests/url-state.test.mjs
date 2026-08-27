import assert from "node:assert/strict";
import test from "node:test";

import { parties, topics } from "../app/data.ts";
import { buildPublicSearch, parsePublicUrl } from "../app/url-state.ts";

const options = {
  partyIds: parties.map((party) => party.id),
  topicIds: topics.map((topic) => topic.id),
};

test("läser en delad jämförelselänk", () => {
  const state = parsePublicUrl("?view=jamfor&parties=vansterpartiet%2Ccenterpartiet&compareTopic=energi", options);
  assert.equal(state.view, "jamfor");
  assert.deepEqual(state.compareIds, ["vansterpartiet", "centerpartiet"]);
  assert.equal(state.compareTopic, "energi");
});

test("bygger en delbar söklänk utan irrelevant tillstånd", () => {
  assert.equal(buildPublicSearch({
    view: "utforska",
    query: "Vilka vill bygga kärnkraft?",
    topic: "energi",
    compareIds: ["moderaterna"],
    compareTopic: "skola",
  }, options), "?q=Vilka+vill+bygga+k%C3%A4rnkraft%3F&topic=energi");
});

test("ignorerar okända partier och sakområden", () => {
  const state = parsePublicUrl("?view=jamfor&parties=okant%2Cmoderaterna&compareTopic=okant", options);
  assert.deepEqual(state.compareIds, ["moderaterna"]);
  assert.equal(state.compareTopic, "ekonomi");
});
