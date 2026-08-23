"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { electionDate, lastUpdated, parties, topics, type Party } from "./data";

type View = "utforska" | "jamfor" | "partier" | "om";
type TopicId = (typeof topics)[number]["id"];

const suggestions = [
  "Vilka partier vill bygga mer kärnkraft?",
  "Vad vill partierna göra åt ungdomsbrottsligheten?",
  "Vilka vill sänka skatten på arbete?",
  "Hur skiljer sig partiernas syn på skolan?",
];

const topicSignals: Record<TopicId, string[]> = {
  ekonomi: ["ekonomi", "skatt", "skatter", "jobb", "arbete", "lön", "pension", "bidrag", "företag"],
  vard: ["vård", "sjukvård", "tandvård", "omsorg", "äldreomsorg", "läkare", "sjukhus", "psykiatri"],
  skola: ["skola", "skolan", "skolor", "elev", "elever", "lärare", "förskola", "familj", "barnbidrag"],
  brott: ["brott", "brottslighet", "kriminalitet", "gäng", "polis", "straff", "trygghet", "våld"],
  migration: ["migration", "invandring", "invandrare", "asyl", "integration", "återvandring", "medborgarskap"],
  klimat: ["klimat", "utsläpp", "miljö", "natur", "skog", "biologisk mångfald"],
  energi: ["energi", "el", "kärnkraft", "vindkraft", "vattenkraft", "elnät", "bränsle", "bensin", "diesel"],
  demokrati: ["demokrati", "eu", "nato", "yttrandefrihet", "rättsstat", "försvar", "ukraina"],
  regering: ["regering", "regeringsfrågan", "samarbete", "block", "statsminister", "koalition"],
};

const stopWords = new Set(["hur", "vad", "vilka", "vilket", "vill", "ska", "skulle", "gor", "gora", "parti", "partier", "partierna", "partiernas", "syn", "skiljer", "sig", "och", "eller", "att", "med", "for", "fran", "till", "inom", "mot", "som", "det", "den", "de", "pa", "om", "at", "mer"]);

function normalize(value: string) {
  return value.toLocaleLowerCase("sv").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function queryWords(value: string) {
  return normalize(value).split(/[^a-z0-9åäö]+/).filter((word) => word.length > 1 && !stopWords.has(word));
}

function inferTopic(value: string): TopicId | null {
  const normalizedQuery = normalize(value);
  let best: { id: TopicId; score: number } | null = null;

  for (const [id, signals] of Object.entries(topicSignals) as [TopicId, string[]][]) {
    const score = signals.reduce((total, signal) => total + (normalizedQuery.includes(normalize(signal)) ? Math.max(1, signal.length / 4) : 0), 0);
    if (score > 0 && (!best || score > best.score)) best = { id, score };
  }

  return best?.id ?? null;
}

function matchScore(party: Party, query: string, activeTopic: string, inferredTopic: TopicId | null) {
  if (!query && activeTopic === "alla") return 1;
  if (!query) return party.positions[activeTopic] ? 1 : 0;

  const words = queryWords(query);
  const selectedText = activeTopic === "alla" ? Object.values(party.positions).join(" ") : party.positions[activeTopic] ?? "";
  const haystack = normalize([party.name, party.ideology, party.overview, ...party.priorities, selectedText].join(" "));
  const partyName = normalize(party.name);
  const directPartyMatch = partyName.includes(normalize(query).trim()) ? 20 : 0;
  const wordScore = words.reduce((score, word) => score + (haystack.includes(word) ? 2 : 0), 0);

  return directPartyMatch + wordScore + (inferredTopic ? 6 : 0);
}

function badgeClass(status: Party["status"]) {
  if (status === "Aktuellt valmanifest") return "verified";
  if (status === "Aktuella vallöften") return "current";
  if (status === "Valprogram publiceras löpande") return "current";
  return "review";
}

function PartyEmblem({ party, compact = false, hero = false }: { party: Party; compact?: boolean; hero?: boolean }) {
  return <span className={`partyEmblem${compact ? " compact" : ""}${hero ? " hero" : ""}`} style={{ "--party": party.color } as React.CSSProperties} aria-hidden="true">
    <span>{party.short}</span>
    <Image src={party.emblem} alt="" width={compact ? 28 : hero ? 76 : 46} height={compact ? 28 : hero ? 76 : 46} onError={(event) => { event.currentTarget.style.display = "none"; }} />
  </span>;
}

const riksdagParties = parties.filter((party) => party.group === "riksdag");
const additionalParties = parties.filter((party) => party.group === "fler");
const sourceCount = parties.reduce((total, party) => total + party.sources.length, 0);

export default function Home() {
  const [view, setView] = useState<View>("utforska");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("alla");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [compareIds, setCompareIds] = useState(["moderaterna", "socialdemokraterna", "sverigedemokraterna"]);
  const [compareTopic, setCompareTopic] = useState("ekonomi");
  const [showAll, setShowAll] = useState(false);

  const inferredTopic = topic === "alla" && query.trim() ? inferTopic(query) : null;
  const activeTopic = topic === "alla" ? inferredTopic ?? "alla" : topic;
  const activeTopicLabel = activeTopic === "alla" ? null : topics.find((item) => item.id === activeTopic)?.label;

  const results = useMemo(() => parties
    .map((party) => ({ party, score: matchScore(party, query, activeTopic, inferredTopic) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.party.name.localeCompare(b.party.name, "sv"))
    .map(({ party }) => party), [query, activeTopic, inferredTopic]);

  const compared = compareIds.map((id) => parties.find((party) => party.id === id)).filter(Boolean) as Party[];
  const visibleResults = showAll ? results : results.slice(0, 6);

  function runSuggestion(value: string) {
    setQuery(value);
    setTopic("alla");
    setShowAll(true);
    setView("utforska");
  }

  function toggleCompare(id: string) {
    setCompareIds((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id);
      if (current.length >= 4) return [...current.slice(1), id];
      return [...current, id];
    });
  }

  return (
    <main>
      <header className="topbar">
        <button className="brand" onClick={() => setView("utforska")} aria-label="Gå till startsidan">
          <span className="brandMark">S</span><span>Sakfrågan</span>
        </button>
        <nav aria-label="Huvudnavigering">
          {(["utforska", "jamfor", "partier", "om"] as View[]).map((item) => (
            <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>
              {item === "utforska" ? "Utforska" : item === "jamfor" ? "Jämför" : item === "partier" ? "Partier" : "Om tjänsten"}
            </button>
          ))}
        </nav>
        <span className="dateBadge"><i /> Uppdaterad {lastUpdated}</span>
      </header>

      {view === "utforska" && <>
        <section className="searchStage">
          <div className="stageCopy">
            <p className="eyebrow">Politik på vanlig svenska</p>
            <h1>Sök, jämför och förstå vad partierna faktiskt vill.</h1>
            <p className="lead">Ställ din fråga med egna ord. Du får korta svar, tydliga skillnader och länkar till partiernas officiella källor.</p>
          </div>
          <div className="searchPanel">
            <label htmlFor="mainSearch">Vad vill du förstå?</label>
            <div className="searchInput">
              <span aria-hidden="true">⌕</span>
              <input id="mainSearch" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Skriv exempelvis kärnkraft, skatt eller skola" />
              {query && <button onClick={() => setQuery("")} aria-label="Rensa sökningen">Rensa</button>}
            </div>
            <p className="searchHint">Sökningen tolkar sakområdet och visar partiernas svar med samma struktur.</p>
            <div className="suggestions" aria-label="Exempelfrågor">
              {suggestions.map((suggestion) => <button key={suggestion} onClick={() => runSuggestion(suggestion)}>{suggestion}</button>)}
            </div>
          </div>
        </section>

        <section className="workspace sectionWrap">
          <div className="topicBar">
            <div>
              <p className="sectionLabel">Välj sakområde</p>
              <div className="topicScroller">
                <button className={topic === "alla" ? "selected" : ""} onClick={() => setTopic("alla")}>Alla frågor</button>
                {topics.map((item) => <button key={item.id} className={topic === item.id ? "selected" : ""} onClick={() => setTopic(item.id)}>{item.label}</button>)}
              </div>
            </div>
            <button className="compareCta" onClick={() => setView("jamfor")}>Öppna jämförelsen <span>→</span></button>
          </div>

          <div className="resultHeader">
            <div>
              <p className="sectionLabel">Sakliga svar</p>
              <h2>{query && activeTopicLabel ? `Partiernas svar om ${activeTopicLabel.toLocaleLowerCase("sv")}` : query ? `Träffar för ”${query}”` : topic === "alla" ? "En överblick över partierna" : topics.find((item) => item.id === topic)?.question}</h2>
              {query && inferredTopic && <span className="interpretationTag" aria-live="polite">Tolkad som {activeTopicLabel}</span>}
            </div>
            <span>{results.length} {inferredTopic ? "partier jämförda" : "partier"}</span>
          </div>

          {visibleResults.length ? <div className="resultGrid">
            {visibleResults.map((party) => <article className="partyCard" key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
              <div className="partyCardTop">
                <div className="partyIdentity"><PartyEmblem party={party} /><div><h3>{party.name}</h3><p>{party.ideology}</p></div></div>
                <span className={`sourceBadge ${badgeClass(party.status)}`}>{party.status}</span>
              </div>
              <div className="factBlock"><span>Partiet säger</span><p>{activeTopic === "alla" ? party.overview : party.positions[activeTopic]}</p></div>
              <div className="cardActions">
                <button onClick={() => setSelectedParty(party)}>Se hela partiprofilen</button>
                <button className="quiet" onClick={() => { if (!compareIds.includes(party.id)) toggleCompare(party.id); setView("jamfor"); }}>Jämför</button>
              </div>
            </article>)}
          </div> : <div className="emptyState"><span>?</span><h3>Ingen tydlig träff ännu</h3><p>Prova ett bredare ord, exempelvis vård, skatt, skola, energi eller trygghet.</p></div>}
          {results.length > 6 && <button className="showMore" onClick={() => setShowAll((value) => !value)}>{showAll ? "Visa färre" : `Visa alla ${results.length} partier`}</button>}
        </section>

        <section className="trustStrip sectionWrap">
          <div><strong>{parties.length}</strong><span>partier kartlagda</span></div>
          <div><strong>{topics.length}</strong><span>sakområden</span></div>
          <div><strong>{sourceCount}</strong><span>officiella källor</span></div>
          <div className="trustText"><b>Fakta först.</b><p>Varje sammanfattning går att kontrollera mot partiets egen källa. Materialet bevakas dagligen fram till valet den {electionDate}.</p></div>
        </section>
      </>}

      {view === "jamfor" && <section className="sectionWrap pageSection">
        <div className="pageIntro"><p className="eyebrow">Se skillnaderna</p><h1>Jämför upp till fyra partier.</h1><p>Välj partier och sakområde. Samma fråga och struktur används för alla.</p></div>
        <div className="compareControls">
          <div><label>Välj partier</label><div className="partyPicker">{parties.map((party) => <button key={party.id} className={compareIds.includes(party.id) ? "picked" : ""} style={{ "--party": party.color } as React.CSSProperties} onClick={() => toggleCompare(party.id)}><PartyEmblem party={party} compact />{party.name}</button>)}</div></div>
          <div><label htmlFor="compareTopic">Välj sakområde</label><select id="compareTopic" value={compareTopic} onChange={(event) => setCompareTopic(event.target.value)}>{topics.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        </div>
        {compared.length ? <div className="compareGrid" style={{ "--count": compared.length } as React.CSSProperties}>
          {compared.map((party) => <article key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
            <div className="compareParty"><PartyEmblem party={party} /><h2>{party.name}</h2></div>
            <p className="comparisonQuestion">{topics.find((item) => item.id === compareTopic)?.question}</p>
            <div className="comparePosition"><span>Partiet säger</span><p>{party.positions[compareTopic]}</p></div>
            <div className="priorityList"><span>Tre tydliga prioriteringar</span><ol>{party.priorities.slice(0, 3).map((priority) => <li key={priority}>{priority}</li>)}</ol></div>
            <button onClick={() => setSelectedParty(party)}>Öppna alla sakområden</button>
          </article>)}
        </div> : <div className="emptyState"><h3>Välj minst ett parti</h3><p>Du kan jämföra upp till fyra partier samtidigt.</p></div>}
      </section>}

      {view === "partier" && <section className="sectionWrap pageSection">
        <div className="pageIntro"><p className="eyebrow">Partier från A till Ö</p><h1>Utforska hela politiken.</h1><p>Alla partier presenteras med samma struktur, oavsett storlek och ideologisk riktning.</p></div>
        <div className="directorySection">
          <div className="directoryHeading"><div><p className="sectionLabel">Riksdagen</p><h2>Riksdagspartier</h2></div><span>Riksdagens åtta partier</span></div>
          <div className="directoryGrid">{riksdagParties.map((party) => <button key={party.id} onClick={() => setSelectedParty(party)} style={{ "--party": party.color } as React.CSSProperties}><PartyEmblem party={party} /><span><b>{party.name}</b><small>{party.ideology}</small></span><i>→</i></button>)}</div>
        </div>
        <div className="directorySection moreParties">
          <div className="directoryHeading"><div><p className="sectionLabel">Bredare urval</p><h2>Fler partier</h2></div><span>{additionalParties.length} partier med nationell inriktning</span></div>
          <div className="selectionNote">
            <div><span>Så görs urvalet</span><p>Urvalet betyder inte stöd eller en prognos. Det gör det möjligt att jämföra tydliga perspektiv på samma villkor.</p></div>
            <ul><li>Ställer upp nationellt 2026</li><li>Har verifierbart officiellt programmaterial</li><li>Tillför ett tydligt perspektiv i jämförelsen</li></ul>
          </div>
          <div className="directoryGrid">{additionalParties.map((party) => <button key={party.id} onClick={() => setSelectedParty(party)} style={{ "--party": party.color } as React.CSSProperties}><PartyEmblem party={party} /><span><b>{party.name}</b><small>{party.ideology}</small></span><i>→</i></button>)}</div>
        </div>
      </section>}

      {view === "om" && <section className="sectionWrap pageSection">
        <div className="pageIntro"><p className="eyebrow">Så fungerar Sakfrågan</p><h1>Neutralitet går att bygga in.</h1><p>Sakfrågan skiljer tydligt på vad partiet säger, vår pedagogiska sammanfattning och den officiella källan.</p></div>
        <div className="principleGrid">
          <article><span>01</span><h2>Samma frågor</h2><p>Alla partier möter samma ämnen, struktur och utrymme. Det gör jämförelsen begriplig.</p></article>
          <article><span>02</span><h2>Källan först</h2><p>Varje ståndpunkt går att följa tillbaka till partiets valmanifest, program eller officiella politiksida.</p></article>
          <article><span>03</span><h2>Aktualitet syns</h2><p>Färska valmanifest skiljs från löpande vallöften och äldre programmaterial. Källorna bevakas dagligen fram till valdagen.</p></article>
        </div>
        <div className="methodCard"><div><p className="sectionLabel">Metod</p><h2>Vad tjänsten gör</h2></div><p>Materialet sammanfattas från partiernas officiella källor. Lokal politik blandas inte med nationell politik. Fakta och analys hålls isär. Brytdatum för denna version är {lastUpdated}. Källor och nya valbesked kontrolleras dagligen fram till valet den {electionDate}.</p></div>
      </section>}

      <footer className="footer"><div className="brand"><span className="brandMark">S</span><span>Sakfrågan</span></div><p>Politik på vanlig svenska. Byggd för förståelse, inte övertalning.</p><button onClick={() => setView("om")}>Metod och transparens</button></footer>

      {selectedParty && <div className="modalBackdrop" role="presentation" onMouseDown={() => setSelectedParty(null)}>
        <section className="partyModal" role="dialog" aria-modal="true" aria-labelledby="partyTitle" onMouseDown={(event) => event.stopPropagation()} style={{ "--party": selectedParty.color } as React.CSSProperties}>
          <button className="closeButton" onClick={() => setSelectedParty(null)} aria-label="Stäng partiprofilen">×</button>
          <div className="modalHero"><PartyEmblem party={selectedParty} hero /><div><p>Partiprofil</p><h1 id="partyTitle">{selectedParty.name}</h1><small>{selectedParty.status}</small></div></div>
          <div className="modalContent">
            <div className="summaryBox"><span>Kort sammanfattning</span><p>{selectedParty.overview}</p></div>
            <div className="modalSection"><h2>Ideologisk riktning</h2><p>{selectedParty.ideology}</p></div>
            <div className="modalSection"><h2>Viktigaste prioriteringarna</h2><ol>{selectedParty.priorities.map((priority) => <li key={priority}>{priority}</li>)}</ol></div>
            <div className="positionList"><h2>Politiken område för område</h2>{topics.map((item) => <details key={item.id}><summary>{item.label}<span>+</span></summary><p>{selectedParty.positions[item.id]}</p></details>)}</div>
            <div className="sources"><h2>Officiella källor</h2>{selectedParty.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>↗</span><div><b>{source.title}</b><small>Kontrollerad {lastUpdated}</small></div></a>)}</div>
          </div>
        </section>
      </div>}
    </main>
  );
}
