import type { Metadata } from "next";
import Link from "next/link";
import { electionDate, lastUpdated, lastUpdatedIso, parties, topics } from "../data";
import { JsonLd, PublicFooter, PublicHeader } from "../public-shell";

export const metadata: Metadata = {
  title: "Metod, urval och källor",
  description: "Så samlar, granskar och sammanfattar Sakfrågan svenska partiers politik inför valet 2026.",
  alternates: { canonical: "/om" },
  openGraph: {
    title: "Så arbetar Sakfrågan",
    description: "Öppen metod, samma struktur för alla partier och länkar till officiella primärkällor.",
    url: "/om",
  },
};

export default function AboutPage() {
  const sourceCount = parties.reduce((sum, party) => sum + party.sources.length, 0);

  return (
    <main>
      <PublicHeader active="om" />
      <section className="seoHero sectionWrap">
        <p className="eyebrow">Metod och transparens</p>
        <h1>Neutralitet går att bygga in.</h1>
        <p>Sakfrågan skiljer på partiets originalmaterial, vår pedagogiska sammanfattning och den redaktionella klassificeringen. Läsaren ska alltid kunna kontrollera underlaget själv.</p>
        <small>Senast granskat {lastUpdated}</small>
      </section>
      <section className="methodPage sectionWrap">
        <div className="principleGrid">
          <article><span>01</span><h2>Samma frågor</h2><p>Alla partier möter samma {topics.length} sakområden, samma struktur och samma krav på källor.</p></article>
          <article><span>02</span><h2>Källan först</h2><p>Sammanfattningarna bygger på valmanifest, partiprogram, politiksidor och andra officiella primärkällor.</p></article>
          <article><span>03</span><h2>Aktualitet syns</h2><p>Färska valmanifest skiljs från löpande vallöften och äldre programmaterial. Materialstatus visas öppet.</p></article>
        </div>
        <div className="methodDetailGrid">
          <article><h2>Urval av partier</h2><p>Partiet ska ställa upp nationellt 2026, ha verifierbart officiellt programmaterial och tillföra ett tydligt perspektiv. Urvalet betyder inte stöd eller en valprognos.</p></article>
          <article><h2>Kontroll av källor</h2><p>Källorna kontrolleras för felkoder, omdirigeringar och innehållsförändringar. En trasig länk ersätts endast när en verifierad officiell motsvarighet finns.</p></article>
          <article><h2>Sammanfattningar</h2><p>Sakfrågans texter är kortare pedagogiska sammanfattningar. De ska inte presenteras som ordagranna citat. Partiets officiella formulering nås alltid via källänken.</p></article>
          <article><h2>Ändringar och rättelser</h2><p>Verifierbara sakförändringar granskas innan de påverkar innehållet. En försvunnen källa raderas inte tyst. Osäker information markeras och får inte fyllas i genom antaganden.</p></article>
        </div>
        <div className="methodStats">
          <div><strong>{parties.length}</strong><span>partier</span></div>
          <div><strong>{topics.length}</strong><span>sakområden</span></div>
          <div><strong>{sourceCount}</strong><span>officiella källor</span></div>
          <p>Källorna bevakas dagligen fram till valet den {electionDate}. Brytdatum för sidans nuvarande innehåll är {lastUpdated}.</p>
        </div>
        <nav className="seoNextSteps" aria-label="Utforska Sakfrågan">
          <Link href="/sakfragor">Utforska sakfrågorna</Link>
          <Link href="/partier">Utforska partierna</Link>
          <Link href="/">Ställ en egen fråga</Link>
        </nav>
      </section>
      <PublicFooter />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "AboutPage",
        url: "https://sakfragan.nu/om",
        name: "Metod, urval och källor",
        dateModified: lastUpdatedIso,
        inLanguage: "sv-SE",
        isPartOf: { "@id": "https://sakfragan.nu/#website" },
      }} />
    </main>
  );
}
