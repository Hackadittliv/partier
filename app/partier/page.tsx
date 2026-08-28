import type { Metadata } from "next";
import Link from "next/link";
import { lastUpdated, lastUpdatedIso, partiesByFounded } from "../data";
import { JsonLd, PartyMark, PublicFooter, PublicHeader } from "../public-shell";

export const metadata: Metadata = {
  title: "Alla partier och deras politik inför valet 2026",
  description: "Utforska svenska partiers politik, prioriteringar, valmanifest och officiella källor. Partierna visas efter grundandeår.",
  alternates: { canonical: "/partier" },
  openGraph: {
    title: "Alla partier inför valet 2026",
    description: "Jämför partiernas politik med samma struktur och officiella källor.",
    url: "/partier",
  },
};

export default function PartiesPage() {
  return (
    <main>
      <PublicHeader active="partier" />
      <section className="seoHero sectionWrap">
        <p className="eyebrow">Äldst till yngst</p>
        <h1>Alla partier på Sakfrågan.</h1>
        <p>Varje parti presenteras med samma frågor, samma struktur och länkar till sitt officiella material. Urvalet är inte ett stöd eller en prognos.</p>
        <small>Senast granskat {lastUpdated}</small>
      </section>
      <section className="seoDirectory sectionWrap" aria-labelledby="partyDirectoryTitle">
        <div className="seoSectionHeading">
          <p className="sectionLabel">Partiregister</p>
          <h2 id="partyDirectoryTitle">Politiken parti för parti</h2>
        </div>
        <div className="seoCardGrid">
          {partiesByFounded.map((party) => (
            <Link className="seoPartyCard" href={`/partier/${party.id}`} key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
              <PartyMark party={party} />
              <span>
                <b>{party.name}</b>
                <small>Grundat {party.founded}. {party.ideology}.</small>
                <em>{party.status}</em>
              </span>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </section>
      <section className="selectionMethod sectionWrap">
        <h2>Så görs urvalet</h2>
        <p>Partiet ska ställa upp nationellt 2026, ha verifierbart officiellt programmaterial och tillföra ett tydligt perspektiv i jämförelsen. Samma krav på källa och tydlighet gäller för samtliga partier.</p>
        <Link href="/om">Läs hela metoden</Link>
      </section>
      <PublicFooter />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Svenska partier på Sakfrågan",
        dateModified: lastUpdatedIso,
        numberOfItems: partiesByFounded.length,
        itemListElement: partiesByFounded.map((party, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: party.name,
          url: `https://sakfragan.nu/partier/${party.id}`,
        })),
      }} />
    </main>
  );
}
