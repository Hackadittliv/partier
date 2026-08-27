export type View = "utforska" | "jamfor" | "partier" | "om";

export type PublicUrlState = {
  view: View;
  query: string;
  topic: string;
  compareIds: string[];
  compareTopic: string;
};

const defaultCompareIds = ["moderaterna", "socialdemokraterna", "sverigedemokraterna"];
const validViews = new Set<View>(["utforska", "jamfor", "partier", "om"]);

export type PublicUrlOptions = {
  partyIds: readonly string[];
  topicIds: readonly string[];
};

export function parsePublicUrl(search: string, options: PublicUrlOptions): PublicUrlState {
  const params = new URLSearchParams(search);
  const validPartyIds = new Set(options.partyIds);
  const validTopicIds = new Set(options.topicIds);
  const requestedView = params.get("view") as View | null;
  const requestedTopic = params.get("topic");
  const requestedCompareTopic = params.get("compareTopic");
  const requestedCompareIds = [...new Set((params.get("parties") ?? "").split(","))]
    .filter((id) => validPartyIds.has(id))
    .slice(0, 4);

  return {
    view: requestedView && validViews.has(requestedView) ? requestedView : "utforska",
    query: (params.get("q") ?? "").trim(),
    topic: requestedTopic && validTopicIds.has(requestedTopic) ? requestedTopic : "alla",
    compareIds: requestedCompareIds.length ? requestedCompareIds : defaultCompareIds,
    compareTopic: requestedCompareTopic && validTopicIds.has(requestedCompareTopic) ? requestedCompareTopic : "ekonomi",
  };
}

export function buildPublicSearch(state: PublicUrlState, options: PublicUrlOptions) {
  const params = new URLSearchParams();
  const validPartyIds = new Set(options.partyIds);
  const validTopicIds = new Set(options.topicIds);

  if (state.view !== "utforska") params.set("view", state.view);
  if (state.view === "utforska") {
    if (state.query.trim()) params.set("q", state.query.trim());
    if (state.topic !== "alla" && validTopicIds.has(state.topic)) params.set("topic", state.topic);
  }
  if (state.view === "jamfor") {
    const compareIds = [...new Set(state.compareIds)].filter((id) => validPartyIds.has(id)).slice(0, 4);
    if (compareIds.length) params.set("parties", compareIds.join(","));
    if (validTopicIds.has(state.compareTopic)) params.set("compareTopic", state.compareTopic);
  }

  const query = params.toString();
  return query ? `?${query}` : "";
}
