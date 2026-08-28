import type { Metadata } from "next";
import Link from "next/link";
import { lastUpdated, lastUpdatedIso, topics } from "../data";
import { JsonLd, PublicFooter, PublicHeader } from "../public-shell";

export const metadata: Metadata = {
  title: "Alla sakfrågor: jämför partiernas politik 2026",
  description: "Jämför svenska partier inom ekonomi, vård, skola, brott, migration, klimat, energi, demokrati och regeringsfrågan.",
  alternates: { canonical: "/sakfragor" },
  openGraph: {
    title: "Alla politiska sakfrågor inför valet 2026",
    description: "Samma fråga, samma struktur och officiella källor för samtliga partier.",
    url: "/sakfragor",
  },
};

export default function TopicsPage() {
  return (
    <main>
      <PublicHeader active="sakfragor" />
      <section className="seoHero sectionWrap">
        <p className="eyebrow">Jämför på samma villkor</p>
        <h1>Politiken sakfråga för sakfråga.</h1>
        <p>Välj ett område och se samtliga partiers sammanfattade ståndpunkter. Varje uppgift kan följas till partiets officiella material.</p>
        <small>Senast granskat {lastUpdated}</small>
      </section>
      <section className="seoDirectory sectionWrap" aria-labelledby="topicDirectoryTitle">
        <div className="seoSectionHeading">
          <p className="sectionLabel">Nio områden</p>
          <h2 id="topicDirectoryTitle">Vad vill du förstå?</h2>
        </div>
        <div className="topicLinkGrid">
          {topics.map((topic, index) => (
            <Link href={`/sakfragor/${topic.id}`} key={topic.id}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h3>{topic.label}</h3><p>{topic.question}</p></div>
              <i aria-hidden="true">→</i>
            </Link>
          ))}
        </div>
      </section>
      <PublicFooter />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Politiska sakfrågor på Sakfrågan",
        dateModified: lastUpdatedIso,
        numberOfItems: topics.length,
        itemListElement: topics.map((topic, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: topic.label,
          url: `https://sakfragan.nu/sakfragor/${topic.id}`,
        })),
      }} />
    </main>
  );
}
