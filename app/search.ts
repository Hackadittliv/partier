import type { Party } from "./data";

export type TopicId = "ekonomi" | "vard" | "skola" | "brott" | "migration" | "klimat" | "energi" | "demokrati" | "regering";
export type Stance = "for" | "against" | "conditional" | "unclear";
export type SearchGoal = "support" | "oppose" | "compare";

export type SearchIntent = {
  id: string;
  topic: TopicId;
  proposition: string;
  question: string;
  signals: string[];
  supportSignals: string[];
  opposeSignals: string[];
  relatedQuestions: string[];
  stances: Record<string, Stance>;
};

export type IntentMatch = {
  intent: SearchIntent;
  confidence: "high" | "medium";
  score: number;
};

export type PartySearchContext = {
  topic: TopicId;
  text: string;
  score: number;
};

export const stanceMeta: Record<Stance, { label: string; shortLabel: string; description: string }> = {
  for: { label: "För förslaget", shortLabel: "För", description: "Partiets publicerade linje stödjer förslaget." },
  against: { label: "Emot förslaget", shortLabel: "Emot", description: "Partiets publicerade linje avvisar förslaget." },
  conditional: { label: "Villkorad linje", shortLabel: "Villkorat", description: "Partiet stödjer delar, ställer villkor eller har en blandad linje." },
  unclear: { label: "Otydlig linje", shortLabel: "Otydligt", description: "Det granskade materialet ger inte ett tillräckligt tydligt svar." },
};

export const searchIntents: SearchIntent[] = [
  {
    id: "new-nuclear",
    topic: "energi",
    proposition: "Bygga ut ny kärnkraft",
    question: "Vilka partier vill bygga ut ny kärnkraft?",
    signals: ["kärnkraft", "kärnreaktor", "reaktorer", "atomkraft", "ny kärnkraft"],
    supportSignals: ["bygga kärnkraft", "ny kärnkraft", "fler reaktorer", "bygga ut kärnkraft"],
    opposeSignals: ["avveckla kärnkraft", "stoppa kärnkraft", "emot kärnkraft", "ingen ny kärnkraft"],
    relatedQuestions: ["Vilka partier vill bygga mer vindkraft?", "Vilka partier vill sänka skatten på arbete?", "Vilka partier vill lämna EU?"],
    stances: {
      centerpartiet: "conditional", kristdemokraterna: "for", liberalerna: "for", miljopartiet: "against", moderaterna: "for", socialdemokraterna: "conditional", sverigedemokraterna: "for", vansterpartiet: "against", medborgerligsamling: "for", nyans: "conditional", orebropartiet: "for", alternativforsverige: "unclear", piratpartiet: "conditional", partietmod: "unclear",
    },
  },
  {
    id: "lower-work-tax",
    topic: "ekonomi",
    proposition: "Sänka skatten på arbete",
    question: "Vilka partier vill sänka skatten på arbete?",
    signals: ["skatt på arbete", "inkomstskatt", "skatt på lön", "jobbskatteavdrag", "lägre skatt på arbete"],
    supportSignals: ["sänka skatten", "lägre skatt", "jobbskatteavdrag", "halvera inkomstskatten"],
    opposeSignals: ["höja skatten på arbete", "stoppa skattesänkningar", "emot skattesänkningar"],
    relatedQuestions: ["Vilka vill stoppa vinster i skolan?", "Vilka vill bygga ny kärnkraft?", "Vilka vill förstatliga vården?"],
    stances: {
      centerpartiet: "for", kristdemokraterna: "for", liberalerna: "for", miljopartiet: "unclear", moderaterna: "for", socialdemokraterna: "conditional", sverigedemokraterna: "conditional", vansterpartiet: "conditional", medborgerligsamling: "for", nyans: "conditional", orebropartiet: "unclear", alternativforsverige: "for", piratpartiet: "unclear", partietmod: "unclear",
    },
  },
  {
    id: "stop-school-profits",
    topic: "skola",
    proposition: "Stoppa vinster i skolan",
    question: "Vilka partier vill stoppa vinster i skolan?",
    signals: ["skolvinster", "vinst i skolan", "vinster i skolan", "vinstuttag i skolan", "marknadsskolan", "friskolevinster"],
    supportSignals: ["stoppa vinster", "förbjuda vinster", "avskaffa marknadsskolan", "stoppa vinstuttag"],
    opposeSignals: ["tillåta vinster", "behålla vinster", "för vinster i skolan"],
    relatedQuestions: ["Vilka partier vill förstatliga skolan?", "Vilka vill sänka skatten på arbete?", "Vilka vill ha hårdare straff?"],
    stances: {
      centerpartiet: "against", kristdemokraterna: "unclear", liberalerna: "for", miljopartiet: "for", moderaterna: "against", socialdemokraterna: "for", sverigedemokraterna: "unclear", vansterpartiet: "for", medborgerligsamling: "against", nyans: "against", orebropartiet: "unclear", alternativforsverige: "unclear", piratpartiet: "unclear", partietmod: "unclear",
    },
  },
  {
    id: "stricter-migration",
    topic: "migration",
    proposition: "Föra en stramare migrationspolitik",
    question: "Vilka partier vill föra en stramare migrationspolitik?",
    signals: ["stram migration", "stramare migration", "minska invandring", "minska asyl", "asylinvandring", "hårdare migration", "öka invandring", "öppnare migration"],
    supportSignals: ["minska invandring", "stramare migration", "hårdare migration", "minska asyl", "stoppa asyl"],
    opposeSignals: ["öka invandring", "mer invandring", "öppnare migration", "lättare asyl"],
    relatedQuestions: ["Vilka vill skärpa straffen?", "Vilka partier vill lämna EU?", "Vilka vill bygga ny kärnkraft?"],
    stances: {
      centerpartiet: "conditional", kristdemokraterna: "for", liberalerna: "conditional", miljopartiet: "against", moderaterna: "for", socialdemokraterna: "for", sverigedemokraterna: "for", vansterpartiet: "against", medborgerligsamling: "for", nyans: "against", orebropartiet: "for", alternativforsverige: "for", piratpartiet: "conditional", partietmod: "unclear",
    },
  },
  {
    id: "harsher-sentences",
    topic: "brott",
    proposition: "Skärpa straffen",
    question: "Vilka partier vill skärpa straffen?",
    signals: ["hårdare straff", "skärpa straff", "skärpta straff", "straffrabatt", "fängelsestraff", "mildare straff"],
    supportSignals: ["hårdare straff", "skärpa straff", "skärpta straff", "längre straff", "avskaffa straffrabatt"],
    opposeSignals: ["mildare straff", "kortare straff", "emot hårdare straff"],
    relatedQuestions: ["Vilka vill föra en stramare migrationspolitik?", "Vilka vill stoppa vinster i skolan?", "Vilka vill förstatliga vården?"],
    stances: {
      centerpartiet: "conditional", kristdemokraterna: "for", liberalerna: "for", miljopartiet: "conditional", moderaterna: "for", socialdemokraterna: "for", sverigedemokraterna: "for", vansterpartiet: "conditional", medborgerligsamling: "for", nyans: "conditional", orebropartiet: "for", alternativforsverige: "for", piratpartiet: "conditional", partietmod: "unclear",
    },
  },
  {
    id: "state-healthcare",
    topic: "vard",
    proposition: "Ge staten huvudansvar för vården",
    question: "Vilka partier vill ge staten huvudansvar för vården?",
    signals: ["förstatliga vården", "statlig vård", "statligt huvudansvar", "avskaffa regionerna", "slopa regionerna", "regionernas vårdansvar"],
    supportSignals: ["förstatliga vården", "statlig vård", "statligt huvudansvar", "avskaffa regionerna", "slopa regionerna"],
    opposeSignals: ["behålla regionerna", "regional vård", "emot statlig vård"],
    relatedQuestions: ["Vilka vill sänka skatten på arbete?", "Vilka vill stoppa vinster i skolan?", "Vilka vill bygga ny kärnkraft?"],
    stances: {
      centerpartiet: "unclear", kristdemokraterna: "for", liberalerna: "unclear", miljopartiet: "unclear", moderaterna: "unclear", socialdemokraterna: "unclear", sverigedemokraterna: "unclear", vansterpartiet: "conditional", medborgerligsamling: "for", nyans: "for", orebropartiet: "conditional", alternativforsverige: "for", piratpartiet: "unclear", partietmod: "unclear",
    },
  },
  {
    id: "leave-eu",
    topic: "demokrati",
    proposition: "Lämna EU",
    question: "Vilka partier vill att Sverige lämnar EU?",
    signals: ["lämna eu", "eu utträde", "ut ur eu", "swexit", "eu medlemskap", "vara kvar i eu", "stanna i eu"],
    supportSignals: ["lämna eu", "eu utträde", "ut ur eu", "swexit"],
    opposeSignals: ["vara kvar i eu", "stanna i eu", "behålla eu medlemskapet"],
    relatedQuestions: ["Vilka partier vill lämna Nato?", "Vilka vill föra en stramare migrationspolitik?", "Vilka vill bygga ny kärnkraft?"],
    stances: {
      centerpartiet: "against", kristdemokraterna: "against", liberalerna: "against", miljopartiet: "against", moderaterna: "against", socialdemokraterna: "against", sverigedemokraterna: "against", vansterpartiet: "against", medborgerligsamling: "conditional", nyans: "against", orebropartiet: "unclear", alternativforsverige: "for", piratpartiet: "against", partietmod: "for",
    },
  },
  {
    id: "leave-nato",
    topic: "demokrati",
    proposition: "Lämna Nato",
    question: "Vilka partier vill att Sverige lämnar Nato?",
    signals: ["lämna nato", "ut ur nato", "nato medlemskap", "stå utanför nato", "vara kvar i nato", "stanna i nato"],
    supportSignals: ["lämna nato", "ut ur nato", "stå utanför nato"],
    opposeSignals: ["vara kvar i nato", "stanna i nato", "behålla nato medlemskapet"],
    relatedQuestions: ["Vilka partier vill lämna EU?", "Vilka vill föra en stramare migrationspolitik?", "Vilka vill skärpa straffen?"],
    stances: {
      centerpartiet: "against", kristdemokraterna: "against", liberalerna: "against", miljopartiet: "unclear", moderaterna: "against", socialdemokraterna: "against", sverigedemokraterna: "against", vansterpartiet: "for", medborgerligsamling: "unclear", nyans: "for", orebropartiet: "unclear", alternativforsverige: "for", piratpartiet: "unclear", partietmod: "for",
    },
  },
];

const topicSignals: Record<TopicId, string[]> = {
  ekonomi: ["ekonomi", "skatt", "skatter", "jobb", "arbete", "lön", "pension", "bidrag", "företag", "arbetslöshet", "ränta"],
  vard: ["vård", "sjukvård", "tandvård", "omsorg", "äldreomsorg", "läkare", "sjukhus", "psykiatri", "regioner", "hemtjänst"],
  skola: ["skola", "skolan", "skolor", "elev", "elever", "lärare", "förskola", "familj", "barnbidrag", "friskola", "betyg"],
  brott: ["brott", "brottslighet", "kriminalitet", "gäng", "polis", "straff", "trygghet", "våld", "fängelse", "narkotika"],
  migration: ["migration", "invandring", "invandrare", "asyl", "integration", "återvandring", "medborgarskap", "utvisning", "anhöriginvandring"],
  klimat: ["klimat", "utsläpp", "miljö", "natur", "skog", "biologisk mångfald", "fossil", "koldioxid"],
  energi: ["energi", "el", "kärnkraft", "vindkraft", "vattenkraft", "elnät", "bränsle", "bensin", "diesel", "reaktor"],
  demokrati: ["demokrati", "eu", "nato", "yttrandefrihet", "rättsstat", "försvar", "ukraina", "folkomröstning", "integritet"],
  regering: ["regering", "regeringsfrågan", "samarbete", "block", "statsminister", "koalition", "regeringsunderlag"],
};

const stopWords = new Set(["hur", "vad", "vilka", "vilket", "vill", "ska", "skulle", "gor", "gora", "parti", "partier", "partierna", "partiernas", "syn", "skiljer", "sig", "och", "eller", "att", "med", "for", "fran", "till", "inom", "mot", "som", "det", "den", "de", "pa", "om", "at", "mer", "sverige", "svenska"]);

export function normalizeText(value: string) {
  return value.toLocaleLowerCase("sv").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

export function queryWords(value: string) {
  return normalizeText(value).split(/\s+/).filter((word) => word.length > 1 && !stopWords.has(word));
}

function levenshtein(a: string, b: string) {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let column = 1; column <= b.length; column += 1) rows[0][column] = column;
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + (a[row - 1] === b[column - 1] ? 0 : 1),
      );
    }
  }
  return rows[a.length][b.length];
}

function wordsMatch(queryWord: string, signalWord: string) {
  if (queryWord === signalWord) return 2;
  if (queryWord.length >= 5 && signalWord.length >= 5 && levenshtein(queryWord, signalWord) <= 1) return 1;
  return 0;
}

export function findPartySearchContext(party: Party, query: string, activeTopic: string): PartySearchContext | null {
  const words = queryWords(query);
  if (!words.length) return null;

  const candidates = (Object.entries(party.positions) as [TopicId, string][])
    .filter(([topic]) => activeTopic === "alla" || topic === activeTopic)
    .map(([topic, text]) => {
      const textWords = normalizeText(text).split(" ");
      const score = words.reduce((total, word) => total + Math.max(0, ...textWords.map((candidate) => wordsMatch(word, candidate))), 0);
      return { topic, text, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0] ?? null;
}

function phraseScore(value: string, signal: string) {
  const normalizedValue = normalizeText(value);
  const normalizedSignal = normalizeText(signal);
  if (normalizedValue.includes(normalizedSignal)) return 8 + normalizedSignal.split(" ").length * 2;

  const valueWords = normalizedValue.split(" ");
  const signalWords = normalizedSignal.split(" ").filter((word) => word.length > 2);
  if (!signalWords.length) return 0;
  const matches = signalWords.map((signalWord) => Math.max(0, ...valueWords.map((queryWord) => wordsMatch(queryWord, signalWord))));
  return matches.every((match) => match > 0) ? matches.reduce((total, match) => total + match, 0) : 0;
}

export function findSearchIntent(value: string): IntentMatch | null {
  if (!value.trim()) return null;
  const candidates = searchIntents
    .map((intent) => ({ intent, score: Math.max(...intent.signals.map((signal) => phraseScore(value, signal))) }))
    .filter(({ score }) => score >= 1)
    .sort((a, b) => b.score - a.score);
  const best = candidates[0];
  if (!best) return null;
  return { ...best, confidence: best.score >= 10 ? "high" : "medium" };
}

export function detectSearchGoal(value: string, intent: SearchIntent): SearchGoal {
  const supportScore = Math.max(0, ...intent.supportSignals.map((signal) => phraseScore(value, signal)));
  const opposeScore = Math.max(0, ...intent.opposeSignals.map((signal) => phraseScore(value, signal)));
  if (supportScore >= 4 && supportScore > opposeScore) return "support";
  if (opposeScore >= 4 && opposeScore > supportScore) return "oppose";
  return "compare";
}

export function inferTopic(value: string): TopicId | null {
  if (!value.trim()) return null;
  const intent = findSearchIntent(value);
  if (intent) return intent.intent.topic;
  let best: { id: TopicId; score: number } | null = null;
  for (const [id, signals] of Object.entries(topicSignals) as [TopicId, string[]][]) {
    const score = Math.max(...signals.map((signal) => phraseScore(value, signal)));
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }
  return best?.id ?? null;
}

export function partyMatchScore(party: Party, query: string, activeTopic: string, inferredTopic: TopicId | null) {
  if (!query && activeTopic === "alla") return 1;
  if (!query) return party.positions[activeTopic] ? 1 : 0;

  const words = queryWords(query);
  const selectedText = activeTopic === "alla" ? Object.values(party.positions).join(" ") : party.positions[activeTopic] ?? "";
  const haystack = normalizeText([party.name, party.short, party.ideology, party.overview, ...party.priorities, selectedText].join(" "));
  const haystackWords = haystack.split(" ");
  const partyName = normalizeText(party.name);
  const normalizedQuery = normalizeText(query);
  const directPartyMatch = normalizedQuery.includes(partyName) || partyName.includes(normalizedQuery) ? 20 : 0;
  const wordScore = words.reduce((score, word) => score + Math.max(0, ...haystackWords.map((candidate) => wordsMatch(word, candidate))), 0);
  return directPartyMatch + wordScore + (inferredTopic ? 6 : 0);
}

export function stanceSortValue(stance: Stance, goal: SearchGoal) {
  if (goal === "support") return { for: 4, conditional: 3, unclear: 2, against: 1 }[stance];
  if (goal === "oppose") return { against: 4, conditional: 3, unclear: 2, for: 1 }[stance];
  return { for: 4, against: 3, conditional: 2, unclear: 1 }[stance];
}
