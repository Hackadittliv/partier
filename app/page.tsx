"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import BrandLogo from "./brand-logo";
import { electionDate, lastUpdated, parties, partiesByFounded, topics, type Party } from "./data";
import { detectSearchGoal, findPartySearchContext, findSearchIntent, inferTopic, normalizeText, partyMatchScore, queryWords, stanceMeta, stanceSortValue, type Stance } from "./search";
import { buildPublicSearch, parsePublicUrl, type View } from "./url-state";

const suggestions = [
  "Vilka partier vill bygga mer kärnkraft?",
  "Vilka vill stoppa vinster i skolan?",
  "Vilka vill föra en stramare migrationspolitik?",
  "Vilka partier vill lämna EU?",
];

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

function HighlightedText({ text, query }: { text: string; query: string }) {
  const words = queryWords(query);
  return <>{text.split(/(\s+)/).map((part, index) => words.includes(normalizeText(part)) ? <mark key={`${part}-${index}`}>{part}</mark> : part)}</>;
}

const riksdagParties = partiesByFounded.filter((party) => party.group === "riksdag");
const additionalParties = partiesByFounded.filter((party) => party.group === "fler");
const sourceCount = parties.reduce((total, party) => total + party.sources.length, 0);
const publicUrlOptions = {
  partyIds: parties.map((party) => party.id),
  topicIds: topics.map((item) => item.id),
};

export default function Home() {
  const resultsRef = useRef<HTMLElement | null>(null);
  const urlReady = useRef(false);
  const [view, setView] = useState<View>("utforska");
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("alla");
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [compareIds, setCompareIds] = useState(["moderaterna", "socialdemokraterna", "sverigedemokraterna"]);
  const [compareTopic, setCompareTopic] = useState("ekonomi");
  const [showAll, setShowAll] = useState(false);
  const [stanceFilter, setStanceFilter] = useState<"all" | Stance>("all");
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    function restoreUrlState() {
      const state = parsePublicUrl(window.location.search, publicUrlOptions);
      setView(state.view);
      setQuery(state.query);
      setTopic(state.topic);
      setCompareIds(state.compareIds);
      setCompareTopic(state.compareTopic);
      setSelectedParty(null);
      setShowAll(false);
      setStanceFilter("all");
    }

    restoreUrlState();
    urlReady.current = true;
    window.addEventListener("popstate", restoreUrlState);
    return () => window.removeEventListener("popstate", restoreUrlState);
  }, []);

  useEffect(() => {
    if (!urlReady.current) return;
    const search = buildPublicSearch({ view, query, topic, compareIds, compareTopic }, publicUrlOptions);
    window.history.replaceState(null, "", `${window.location.pathname}${search}${window.location.hash}`);
  }, [view, query, topic, compareIds, compareTopic]);

  const rawIntentMatch = query.trim() ? findSearchIntent(query) : null;
  const intentMatch = rawIntentMatch && (topic === "alla" || rawIntentMatch.intent.topic === topic) ? rawIntentMatch : null;
  const searchGoal = intentMatch ? detectSearchGoal(query, intentMatch.intent) : "compare";
  const inferredTopic = topic === "alla" && query.trim() ? intentMatch?.intent.topic ?? inferTopic(query) : null;
  const activeTopic = topic === "alla" ? inferredTopic ?? "alla" : topic;
  const activeTopicLabel = activeTopic === "alla" ? null : topics.find((item) => item.id === activeTopic)?.label;
  const isTextSearch = Boolean(query.trim() && !intentMatch && !activeTopicLabel);

  const results = useMemo(() => parties
    .map((party) => ({ party, score: partyMatchScore(party, query, activeTopic, inferredTopic) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => {
      if (!query.trim()) return a.party.founded - b.party.founded || a.party.name.localeCompare(b.party.name, "sv");
      if (intentMatch) {
        const aStance = intentMatch.intent.stances[a.party.id] ?? "unclear";
        const bStance = intentMatch.intent.stances[b.party.id] ?? "unclear";
        const stanceDifference = stanceSortValue(bStance, searchGoal) - stanceSortValue(aStance, searchGoal);
        if (stanceDifference) return stanceDifference;
      }
      return b.score - a.score || a.party.name.localeCompare(b.party.name, "sv");
    })
    .map(({ party }) => party), [query, activeTopic, inferredTopic, intentMatch, searchGoal]);

  const compared = compareIds.map((id) => parties.find((party) => party.id === id)).filter(Boolean) as Party[];
  const filteredResults = intentMatch && stanceFilter !== "all" ? results.filter((party) => (intentMatch.intent.stances[party.id] ?? "unclear") === stanceFilter) : results;
  const visibleResults = showAll ? filteredResults : filteredResults.slice(0, 6);
  const stanceCounts = intentMatch ? parties.reduce((counts, party) => {
    const stance = intentMatch.intent.stances[party.id] ?? "unclear";
    counts[stance] += 1;
    return counts;
  }, { for: 0, against: 0, conditional: 0, unclear: 0 } as Record<Stance, number>) : null;

  function scrollToResults() {
    window.requestAnimationFrame(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      resultsRef.current?.focus({ preventScroll: true });
    });
  }

  function runSuggestion(value: string) {
    setQuery(value);
    setTopic("alla");
    setStanceFilter("all");
    setShowAll(false);
    setView("utforska");
    window.requestAnimationFrame(() => window.requestAnimationFrame(scrollToResults));
  }

  async function copyShareLink() {
    const url = new URL(window.location.href);
    url.search = buildPublicSearch({ view, query, topic, compareIds, compareTopic }, publicUrlOptions);
    try {
      await navigator.clipboard.writeText(url.toString());
      setLinkCopied(true);
      window.setTimeout(() => setLinkCopied(false), 1800);
    } catch {
      setLinkCopied(false);
    }
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
          <BrandLogo />
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
              <input
                id="mainSearch"
                value={query}
                onChange={(event) => { setQuery(event.target.value); setStanceFilter("all"); setShowAll(false); }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && query.trim()) {
                    event.preventDefault();
                    scrollToResults();
                  }
                }}
                aria-describedby={query.trim() ? "searchHint searchFeedback" : "searchHint"}
                placeholder="Fråga exempelvis vilka som vill bygga kärnkraft"
              />
              {query && <button onClick={() => { setQuery(""); setStanceFilter("all"); setShowAll(false); }} aria-label="Rensa sökningen">Rensa</button>}
            </div>
            <p className="searchHint" id="searchHint">Resultaten uppdateras direkt när du skriver. Otydliga svar markeras öppet.</p>
            {query.trim() && <div className="searchFeedback">
              <div className="feedbackStatus" id="searchFeedback" role="status" aria-live="polite">
                <span aria-hidden="true" />
                <div>
                  <b>{activeTopicLabel ? `Tolkad som ${activeTopicLabel}` : "Textträffar hittade"}</b>
                  <small>{filteredResults.length} {filteredResults.length === 1 ? "träff är redo" : "träffar är redo"} längre ner på sidan.</small>
                </div>
              </div>
              <button onClick={scrollToResults}>Visa {filteredResults.length} {filteredResults.length === 1 ? "träff" : "träffar"} <span aria-hidden="true">↓</span></button>
            </div>}
            <div className="suggestions" aria-label="Exempelfrågor">
              {suggestions.map((suggestion) => <button key={suggestion} onClick={() => runSuggestion(suggestion)}>{suggestion}</button>)}
            </div>
          </div>
        </section>

        <section className="workspace sectionWrap" ref={resultsRef} tabIndex={-1}>
          <div className="topicBar">
            <div>
              <p className="sectionLabel">Välj sakområde</p>
              <div className="topicScroller">
                <button className={topic === "alla" ? "selected" : ""} onClick={() => { setTopic("alla"); setStanceFilter("all"); setShowAll(false); }}>Alla frågor</button>
                {topics.map((item) => <button key={item.id} className={topic === item.id ? "selected" : ""} onClick={() => { setTopic(item.id); setStanceFilter("all"); setShowAll(false); }}>{item.label}</button>)}
              </div>
            </div>
            <button className="compareCta" onClick={() => setView("jamfor")}>Öppna jämförelsen <span>→</span></button>
          </div>

          {query && intentMatch && stanceCounts && <section className="directAnswer" aria-live="polite">
            <div className="answerHeading">
              <div>
                <span className={`confidenceBadge ${intentMatch.confidence}`}>{intentMatch.confidence === "high" ? "Tydlig frågetolkning" : "Möjlig frågetolkning"}</span>
                <p className="sectionLabel">Kort svar</p>
                <h2>{intentMatch.intent.question}</h2>
                <p>{searchGoal === "support" ? `${stanceCounts.for} partier har en tydligt stödjande linje i den riktning du frågar efter.` : searchGoal === "oppose" ? `${stanceCounts.against} partier har en tydligt avvisande linje i den riktning du frågar efter.` : "Partierna grupperas efter den riktning som framgår av deras publicerade material."}</p>
              </div>
              <div className="answerPrinciple"><span>Så läser du svaret</span><p>Riktningen är en redaktionell klassificering. Partiets egen formulering och officiella källa visas alltid under.</p></div>
            </div>
            <div className="stanceFilters" aria-label="Filtrera efter ståndpunkt">
              <button className={stanceFilter === "all" ? "selected" : ""} onClick={() => { setStanceFilter("all"); setShowAll(false); }}><strong>{parties.length}</strong><span>Alla</span></button>
              {(["for", "against", "conditional", "unclear"] as Stance[]).map((stance) => <button key={stance} className={`${stance}${stanceFilter === stance ? " selected" : ""}`} onClick={() => { setStanceFilter(stance); setShowAll(true); }}><strong>{stanceCounts[stance]}</strong><span>{stanceMeta[stance].shortLabel}</span><small>{stanceMeta[stance].description}</small></button>)}
            </div>
            <div className="relatedQuestions"><span>Fråga vidare</span>{intentMatch.intent.relatedQuestions.map((question) => <button key={question} onClick={() => runSuggestion(question)}>{question}</button>)}</div>
          </section>}

          {query && !intentMatch && inferredTopic && <div className="topicInterpretation" aria-live="polite"><span>Sakområde identifierat</span><strong>{activeTopicLabel}</strong><p>Frågan ger ännu ingen säker riktning mellan för och emot. Därför visas partiernas fulla ståndpunkt inom området.</p></div>}

          <div className="resultHeader">
            <div>
              <p className="sectionLabel">{isTextSearch ? "Textträffar" : "Sakliga svar"}</p>
              <h2>{query && intentMatch ? intentMatch.intent.proposition : query && activeTopicLabel ? `Partiernas svar om ${activeTopicLabel.toLocaleLowerCase("sv")}` : query ? `Textträffar för ”${query}”` : topic === "alla" ? "En överblick över partierna" : topics.find((item) => item.id === topic)?.question}</h2>
              {query && inferredTopic && <span className="interpretationTag" aria-live="polite">Tolkad som {activeTopicLabel}</span>}
            </div>
            <div className="resultMeta">
              <span>{filteredResults.length} {isTextSearch ? filteredResults.length === 1 ? "textträff" : "textträffar" : inferredTopic ? "partier jämförda" : query.trim() ? "partier" : "partier · äldst till yngst"}</span>
              {(query.trim() || topic !== "alla") && <button className="shareButton" onClick={copyShareLink}>{linkCopied ? "Länk kopierad" : "Kopiera länk"}</button>}
            </div>
          </div>

          {visibleResults.length ? <div className="resultGrid">
            {visibleResults.map((party) => {
              const searchContext = isTextSearch ? findPartySearchContext(party, query, activeTopic) : null;
              const cardText = searchContext?.text ?? (activeTopic === "alla" ? party.overview : party.positions[activeTopic]);
              const contextLabel = searchContext ? topics.find((item) => item.id === searchContext.topic)?.label : null;
              return <article className="partyCard" key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
                <div className="partyCardTop">
                  <div className="partyIdentity"><PartyEmblem party={party} /><div><h3>{party.name}</h3><p>Grundat {party.founded} · {party.ideology}</p></div></div>
                  <span className={`sourceBadge ${badgeClass(party.status)}`}>{party.status}</span>
                </div>
                <div className="factBlock">
                  {intentMatch && <div className="stanceLine"><b className={`stanceBadge ${intentMatch.intent.stances[party.id] ?? "unclear"}`}>{stanceMeta[intentMatch.intent.stances[party.id] ?? "unclear"].label}</b><small>{stanceMeta[intentMatch.intent.stances[party.id] ?? "unclear"].description}</small></div>}
                  {searchContext && <div className="matchContext"><span>Textträff</span><b>{contextLabel}</b></div>}
                  <span>{searchContext ? "Matchande text" : intentMatch ? "Partiets publicerade position" : "Sammanfattad ståndpunkt"}</span>
                  <p>{searchContext ? <HighlightedText text={cardText} query={query} /> : cardText}</p>
                </div>
                {party.sources[0] && <a className="inlineSource" href={party.sources[0].url} target="_blank" rel="noreferrer"><span>Officiell källa</span><b>{party.sources[0].title}</b><i>↗</i></a>}
                <div className="cardActions">
                  <button onClick={() => setSelectedParty(party)}>Se hela partiprofilen</button>
                  <button className="quiet" onClick={() => { if (!compareIds.includes(party.id)) toggleCompare(party.id); setView("jamfor"); }}>Jämför</button>
                </div>
              </article>;
            })}
          </div> : <div className="emptyState"><span>?</span><h3>Ingen tydlig träff ännu</h3><p>Prova ett bredare ord, exempelvis vård, skatt, skola, energi eller trygghet.</p></div>}
          {filteredResults.length > 6 && <button className="showMore" onClick={() => setShowAll((value) => !value)}>{showAll ? "Visa färre" : `Visa alla ${filteredResults.length} partier`}</button>}
        </section>

        <section className="trustStrip sectionWrap">
          <div><strong>{parties.length}</strong><span>partier kartlagda</span></div>
          <div><strong>{topics.length}</strong><span>sakområden</span></div>
          <div><strong>{sourceCount}</strong><span>officiella källor</span></div>
          <div className="trustText"><b>Fakta först.</b><p>Varje sammanfattning går att kontrollera mot partiets egen källa. Materialet bevakas dagligen fram till valet den {electionDate}.</p></div>
        </section>
      </>}

      {view === "jamfor" && <section className="sectionWrap pageSection">
        <div className="pageIntro"><p className="eyebrow">Se skillnaderna</p><h1>Jämför upp till fyra partier.</h1><p>Välj partier och sakområde. Samma fråga och struktur används för alla.</p><button className="shareButton" onClick={copyShareLink}>{linkCopied ? "Länk kopierad" : "Kopiera jämförelselänk"}</button></div>
        <div className="compareControls">
          <div><label>Välj partier · äldst till yngst</label><div className="partyPicker">{partiesByFounded.map((party) => <button key={party.id} className={compareIds.includes(party.id) ? "picked" : ""} style={{ "--party": party.color } as React.CSSProperties} onClick={() => toggleCompare(party.id)}><PartyEmblem party={party} compact /><span>{party.name}<small>{party.founded}</small></span></button>)}</div></div>
          <div><label htmlFor="compareTopic">Välj sakområde</label><select id="compareTopic" value={compareTopic} onChange={(event) => setCompareTopic(event.target.value)}>{topics.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></div>
        </div>
        {compared.length ? <div className="compareGrid" style={{ "--count": compared.length } as React.CSSProperties}>
          {compared.map((party) => <article key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
            <div className="compareParty"><PartyEmblem party={party} /><h2>{party.name}</h2></div>
            <p className="comparisonQuestion">{topics.find((item) => item.id === compareTopic)?.question}</p>
            <div className="comparePosition"><span>Sammanfattad ståndpunkt</span><p>{party.positions[compareTopic]}</p></div>
            <div className="priorityList"><span>Partiets övergripande prioriteringar</span><ol>{party.priorities.slice(0, 3).map((priority) => <li key={priority}>{priority}</li>)}</ol></div>
            <button onClick={() => setSelectedParty(party)}>Öppna alla sakområden</button>
          </article>)}
        </div> : <div className="emptyState"><h3>Välj minst ett parti</h3><p>Du kan jämföra upp till fyra partier samtidigt.</p></div>}
      </section>}

      {view === "partier" && <section className="sectionWrap pageSection">
        <div className="pageIntro"><p className="eyebrow">Äldst till yngst</p><h1>Utforska hela politiken.</h1><p>Partierna visas efter grundandeår och presenteras med samma struktur, oavsett storlek och ideologisk riktning.</p></div>
        <div className="directorySection">
          <div className="directoryHeading"><div><p className="sectionLabel">Riksdagen</p><h2>Riksdagspartier</h2></div><span>Riksdagens åtta partier</span></div>
          <div className="directoryGrid">{riksdagParties.map((party) => <button key={party.id} onClick={() => setSelectedParty(party)} style={{ "--party": party.color } as React.CSSProperties}><PartyEmblem party={party} /><span><b>{party.name}</b><small>Grundat {party.founded} · {party.ideology}</small></span><i>→</i></button>)}</div>
        </div>
        <div className="directorySection moreParties">
          <div className="directoryHeading"><div><p className="sectionLabel">Bredare urval</p><h2>Fler partier</h2></div><span>{additionalParties.length} partier med nationell inriktning</span></div>
          <div className="selectionNote">
            <div><span>Så görs urvalet</span><p>Urvalet betyder inte stöd eller en prognos. Det gör det möjligt att jämföra tydliga perspektiv på samma villkor.</p></div>
            <ul><li>Ställer upp nationellt 2026</li><li>Har verifierbart officiellt programmaterial</li><li>Tillför ett tydligt perspektiv i jämförelsen</li></ul>
          </div>
          <div className="directoryGrid">{additionalParties.map((party) => <button key={party.id} onClick={() => setSelectedParty(party)} style={{ "--party": party.color } as React.CSSProperties}><PartyEmblem party={party} /><span><b>{party.name}</b><small>Grundat {party.founded} · {party.ideology}</small></span><i>→</i></button>)}</div>
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

      <footer className="footer"><div className="brand"><BrandLogo /></div><p>Politik på vanlig svenska. Byggd för förståelse, inte övertalning.</p><button onClick={() => setView("om")}>Metod och transparens</button></footer>

      {selectedParty && <div className="modalBackdrop" role="presentation" onMouseDown={() => setSelectedParty(null)}>
        <section className="partyModal" role="dialog" aria-modal="true" aria-labelledby="partyTitle" onMouseDown={(event) => event.stopPropagation()} style={{ "--party": selectedParty.color } as React.CSSProperties}>
          <button className="closeButton" onClick={() => setSelectedParty(null)} aria-label="Stäng partiprofilen">×</button>
          <div className="modalHero"><PartyEmblem party={selectedParty} hero /><div><p>Partiprofil</p><h1 id="partyTitle">{selectedParty.name}</h1><small>Grundat {selectedParty.founded} · {selectedParty.status}</small></div></div>
          <div className="modalContent">
            <div className="summaryBox"><span>Kort sammanfattning</span><p>{selectedParty.overview}</p></div>
            <div className="modalSection"><h2>Ideologisk riktning</h2><p>{selectedParty.ideology}</p></div>
            <div className="modalSection"><h2>Viktigaste prioriteringarna</h2><ol>{selectedParty.priorities.map((priority) => <li key={priority}>{priority}</li>)}</ol></div>
            <div className="positionList"><h2>Politiken område för område</h2>{topics.map((item) => <details key={item.id}><summary>{item.label}<span>+</span></summary><p>{selectedParty.positions[item.id]}</p></details>)}</div>
            <div className="sources"><h2>Officiella källor</h2>{selectedParty.sources.map((source) => <a key={source.url} href={source.url} target="_blank" rel="noreferrer"><span>↗</span><div><b>{source.title}</b><small>{source.publishedAt ? `Publicerad ${source.publishedAt} · ` : ""}Kontrollerad {lastUpdated}</small></div></a>)}</div>
          </div>
        </section>
      </div>}
    </main>
  );
}
