"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import BrandLogo from "../brand-logo";

const REVIEW_ENDPOINT =
  "https://zcwfwfhgmsnzajzrryvm.supabase.co/functions/v1/sakfragan-review";
const SESSION_KEY = "sakfraganReviewToken";

type Snapshot = {
  id: string;
  title: string | null;
  content_text: string | null;
  content_markdown: string | null;
  fetched_at: string;
};

type ReviewItem = {
  id: string;
  item_id: string;
  title: string;
  rationale: string | null;
  priority: number;
  status: "pending" | "in_review";
  created_at: string;
  party: {
    id: string;
    name: string;
    short_name: string;
    ideology: string;
    color: string;
    emblem_path: string | null;
  } | null;
  change: {
    id: string;
    change_kind: string;
    materiality: string;
    summary: string | null;
    diff_text: string | null;
    detected_at: string;
  } | null;
  source: {
    title: string;
    canonical_url: string;
    source_kind: string;
  } | null;
  before: Snapshot | null;
  after: Snapshot | null;
};

type Queue = {
  items: ReviewItem[];
  counts: {
    pending: number;
    inReview: number;
    urgent: number;
  };
};

function textFromSnapshot(snapshot: Snapshot | null) {
  if (!snapshot) return "Ingen tidigare version finns sparad.";
  return snapshot.content_text || snapshot.content_markdown || "Versionen saknar läsbar text.";
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("sv-SE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ReviewPanel() {
  const [token, setToken] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [queue, setQueue] = useState<Queue | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "in_review">("all");
  const [saving, setSaving] = useState(false);

  const loadQueue = useCallback(async (accessToken: string) => {
    setStatus("loading");
    setError("");

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        headers: { "x-sakfragan-admin": accessToken },
        cache: "no-store",
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Granskningskön kunde inte hämtas.");
      }

      setQueue(payload);
      setToken(accessToken);
      setSelectedId((current) =>
        current && payload.items.some((item: ReviewItem) => item.id === current)
          ? current
          : payload.items[0]?.id ?? null
      );
      setStatus("ready");
      return true;
    } catch (caught) {
      setStatus("error");
      setError(caught instanceof Error ? caught.message : "Något gick fel.");
      return false;
    }
  }, []);

  useEffect(() => {
    const savedToken = window.sessionStorage.getItem(SESSION_KEY);
    if (!savedToken) return;

    const timer = window.setTimeout(() => void loadQueue(savedToken), 0);
    return () => window.clearTimeout(timer);
  }, [loadQueue]);

  const visibleItems = useMemo(
    () => queue?.items.filter((item) => filter === "all" || item.status === filter) ?? [],
    [filter, queue],
  );
  const selected =
    visibleItems.find((item) => item.id === selectedId) ??
    queue?.items.find((item) => item.id === selectedId) ??
    visibleItems[0] ??
    null;

  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const candidate = tokenInput.trim();
    const accepted = await loadQueue(candidate);
    if (accepted) window.sessionStorage.setItem(SESSION_KEY, candidate);
  }

  function signOut() {
    window.sessionStorage.removeItem(SESSION_KEY);
    setToken("");
    setTokenInput("");
    setQueue(null);
    setStatus("idle");
    setSelectedId(null);
    setNotice("");
    setError("");
  }

  async function review(action: "start" | "approve" | "reject") {
    if (!selected || !token) return;
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const response = await fetch(REVIEW_ENDPOINT, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-sakfragan-admin": token,
        },
        body: JSON.stringify({
          action,
          reviewItemId: selected.id,
          changeId: selected.change?.id,
          notes,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Granskningen kunde inte sparas.");
      setNotice(payload.message);
      setNotes("");
      await loadQueue(token);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Granskningen kunde inte sparas.");
    } finally {
      setSaving(false);
    }
  }

  if (!token) {
    return (
      <main className="reviewShell">
        <header className="reviewHeader">
          <Link href="/" className="brand" aria-label="Till Sakfrågans startsida">
            <BrandLogo />
          </Link>
          <span className="reviewHeaderLabel">Redaktion</span>
        </header>
        <section className="reviewLogin">
          <div className="reviewLoginCopy">
            <span className="sectionLabel">Skyddad redaktion</span>
            <h1>Granska varje ändring innan den påverkar innehållet.</h1>
            <p>
              Här samlas upptäckta ändringar från partiernas officiella källor. Ett godkännande
              skickar ändringen vidare till redaktionell bearbetning. Ingenting publiceras automatiskt.
            </p>
            <ol>
              <li>Källan kontrolleras och en ny version sparas.</li>
              <li>Ändringen jämförs med den tidigare versionen.</li>
              <li>Redaktionen godkänner eller avvisar underlaget.</li>
            </ol>
          </div>
          <form className="reviewLoginCard" onSubmit={signIn}>
            <span className="reviewLock" aria-hidden="true">S</span>
            <h2>Öppna granskningspanelen</h2>
            <p>Ange redaktionens personliga granskningsnyckel.</p>
            <label htmlFor="reviewToken">Granskningsnyckel</label>
            <input
              id="reviewToken"
              type="password"
              value={tokenInput}
              onChange={(event) => setTokenInput(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error && <p className="reviewError" role="alert">{error}</p>}
            <button type="submit" disabled={status === "loading"}>
              {status === "loading" ? "Kontrollerar åtkomst" : "Öppna panelen"}
            </button>
            <small>Nyckeln sparas bara under den här webbläsarsessionen.</small>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="reviewShell">
      <header className="reviewHeader">
        <Link href="/" className="brand" aria-label="Till Sakfrågans startsida">
          <BrandLogo />
        </Link>
        <div className="reviewHeaderActions">
          <span className="reviewLive"><i /> Källflödet är anslutet</span>
          <button type="button" onClick={signOut}>Lås panelen</button>
        </div>
      </header>

      <section className="reviewWorkspace">
        <div className="reviewIntro">
          <div>
            <span className="sectionLabel">Redaktionell kontroll</span>
            <h1>Granskningskö</h1>
            <p>Bedöm nytt material innan Sakfrågans politiska innehåll uppdateras.</p>
          </div>
          <button type="button" className="reviewRefresh" onClick={() => void loadQueue(token)}>
            Uppdatera kön
          </button>
        </div>

        <div className="reviewMetrics">
          <article>
            <span>Väntar</span>
            <strong>{queue?.counts.pending ?? 0}</strong>
            <small>nya underlag</small>
          </article>
          <article>
            <span>Pågår</span>
            <strong>{queue?.counts.inReview ?? 0}</strong>
            <small>aktiva granskningar</small>
          </article>
          <article>
            <span>Prioriterade</span>
            <strong>{queue?.counts.urgent ?? 0}</strong>
            <small>kräver snabb kontroll</small>
          </article>
          <article className="reviewPrinciple">
            <span>Publiceringsprincip</span>
            <p>Maskinen hittar förändringen. En människa bedömer betydelsen.</p>
          </article>
        </div>

        {notice && <div className="reviewNotice" role="status">{notice}</div>}
        {error && <div className="reviewErrorBanner" role="alert">{error}</div>}

        <div className="reviewBoard">
          <aside className="reviewQueue">
            <div className="reviewQueueHeader">
              <h2>Underlag</h2>
              <span>{visibleItems.length}</span>
            </div>
            <div className="reviewFilters" aria-label="Filtrera granskningskön">
              <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Alla</button>
              <button className={filter === "pending" ? "active" : ""} onClick={() => setFilter("pending")}>Väntar</button>
              <button className={filter === "in_review" ? "active" : ""} onClick={() => setFilter("in_review")}>Pågår</button>
            </div>

            {status === "loading" && !queue ? (
              <div className="reviewQueueEmpty">Hämtar granskningskön.</div>
            ) : visibleItems.length ? (
              <div className="reviewQueueList">
                {visibleItems.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={selected?.id === item.id ? "selected" : ""}
                    onClick={() => {
                      setSelectedId(item.id);
                      setNotes("");
                      setNotice("");
                    }}
                  >
                    <span className="reviewPartyDot" style={{ background: item.party?.color ?? "#516171" }}>
                      {item.party?.short_name ?? "?"}
                    </span>
                    <span>
                      <b>{item.party?.name ?? "Okänt parti"}</b>
                      <small>{item.source?.title ?? item.title}</small>
                      <i>{formatDate(item.created_at)}</i>
                    </span>
                    <em className={item.status}>{item.status === "pending" ? "Ny" : "Pågår"}</em>
                  </button>
                ))}
              </div>
            ) : (
              <div className="reviewQueueEmpty">
                <span>✓</span>
                <b>Kön är tom</b>
                <p>Alla upptäckta källändringar är hanterade.</p>
              </div>
            )}
          </aside>

          <section className="reviewDetail">
            {selected ? (
              <>
                <div className="reviewDetailHeader">
                  <div className="reviewIdentity">
                    <span className="reviewPartyDot large" style={{ background: selected.party?.color ?? "#516171" }}>
                      {selected.party?.short_name ?? "?"}
                    </span>
                    <div>
                      <span>{selected.party?.name ?? "Okänt parti"}</span>
                      <h2>{selected.source?.title ?? selected.title}</h2>
                    </div>
                  </div>
                  <div className="reviewBadges">
                    <span>Prioritet {selected.priority}</span>
                    <span>{selected.change?.materiality === "unknown" ? "Betydelse bedöms" : selected.change?.materiality}</span>
                  </div>
                </div>

                <div className="reviewSourceRow">
                  <div>
                    <span>Officiell källa</span>
                    <b>{selected.source?.canonical_url ?? "Källadress saknas"}</b>
                  </div>
                  {selected.source?.canonical_url && (
                    <a href={selected.source.canonical_url} target="_blank" rel="noreferrer">
                      Öppna originalet <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>

                <div className="reviewSummary">
                  <span>Systemets observation</span>
                  <p>{selected.change?.summary ?? selected.rationale ?? "Inget sammandrag finns ännu."}</p>
                </div>

                <div className="reviewDiff">
                  <article>
                    <header>
                      <span>Tidigare version</span>
                      {selected.before?.fetched_at && <time>{formatDate(selected.before.fetched_at)}</time>}
                    </header>
                    <div>{textFromSnapshot(selected.before)}</div>
                  </article>
                  <article className="after">
                    <header>
                      <span>Ny version</span>
                      {selected.after?.fetched_at && <time>{formatDate(selected.after.fetched_at)}</time>}
                    </header>
                    <div>{textFromSnapshot(selected.after)}</div>
                  </article>
                </div>

                {selected.change?.diff_text && (
                  <details className="reviewRawDiff">
                    <summary>Visa teknisk ändringsmarkering</summary>
                    <pre>{selected.change.diff_text}</pre>
                  </details>
                )}

                <div className="reviewDecision">
                  <label htmlFor="reviewNotes">Redaktionell anteckning</label>
                  <textarea
                    id="reviewNotes"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Beskriv varför ändringen godkänns eller avvisas."
                  />
                  <p>Ett godkännande publicerar inget. Det markerar bara underlaget som redo för redaktionell bearbetning.</p>
                  <div>
                    {selected.status === "pending" && (
                      <button type="button" className="quiet" disabled={saving} onClick={() => void review("start")}>
                        Påbörja granskning
                      </button>
                    )}
                    <button type="button" className="reject" disabled={saving} onClick={() => void review("reject")}>
                      Avvisa ändring
                    </button>
                    <button type="button" className="approve" disabled={saving} onClick={() => void review("approve")}>
                      {saving ? "Sparar beslut" : "Godkänn för bearbetning"}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="reviewDetailEmpty">
                <span>✓</span>
                <h2>Allt är granskat</h2>
                <p>Nästa upptäckta källändring visas här automatiskt.</p>
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
