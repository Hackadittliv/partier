import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lastUpdated, lastUpdatedIso, parties, topics } from "../../data";
import { JsonLd, PartyMark, PublicFooter, PublicHeader } from "../../public-shell";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return parties.map((party) => ({ id: party.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const party = parties.find((item) => item.id === id);
  if (!party) return {};
  const title = `${party.name}: politik och viktigaste frågor 2026`;
  const description = `Jämför politiken från ${party.name} inom nio sakområden inför valet 2026. Läs prioriteringar, materialstatus och verifierade officiella källor.`;

  return {
    title,
    description,
    alternates: { canonical: `/partier/${party.id}` },
    openGraph: { title, description, url: `/partier/${party.id}`, type: "article" },
    twitter: { title, description },
  };
}

export default async function PartyPage({ params }: PageProps) {
  const { id } = await params;
  const party = parties.find((item) => item.id === id);
  if (!party) notFound();

  return (
    <main>
      <PublicHeader active="partier" />
      <div className="breadcrumbs sectionWrap" aria-label="Brödsmulor">
        <Link href="/">Sakfrågan</Link><span aria-hidden="true">›</span><Link href="/partier">Partier</Link><span aria-hidden="true">›</span><span>{party.name}</span>
      </div>
      <article className="partySeoPage sectionWrap" style={{ "--party": party.color } as React.CSSProperties}>
        <header className="partySeoHero">
          <PartyMark party={party} large />
          <div>
            <p className="eyebrow">Partiprofil</p>
            <h1>{party.name}: politik inför valet 2026</h1>
            <p>{party.overview}</p>
            <div className="seoFacts">
              <span>Grundat <b>{party.founded}</b></span>
              <span>Inriktning <b>{party.ideology}</b></span>
              <span>Materialstatus <b>{party.status}</b></span>
            </div>
          </div>
        </header>

        <section className="priorityPanel" aria-labelledby="prioritiesTitle">
          <div><p className="sectionLabel">Kort svar</p><h2 id="prioritiesTitle">Partiets viktigaste prioriteringar</h2></div>
          <ol>{party.priorities.map((priority) => <li key={priority}>{priority}</li>)}</ol>
        </section>

        <section className="positionDirectory" aria-labelledby="positionsTitle">
          <div className="seoSectionHeading">
            <p className="sectionLabel">Område för område</p>
            <h2 id="positionsTitle">Vad vill {party.name}?</h2>
            <p>Varje text är en neutral sammanfattning av partiets publicerade material. Följ källorna längst ner för originalformuleringarna.</p>
          </div>
          <div className="positionGrid">
            {topics.map((topic) => (
              <article id={topic.id} key={topic.id}>
                <Link href={`/sakfragor/${topic.id}`}>{topic.label}</Link>
                <h3>{topic.question}</h3>
                <p>{party.positions[topic.id]}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="sourcePanel" aria-labelledby="sourcesTitle">
          <div>
            <p className="sectionLabel">Primärkällor</p>
            <h2 id="sourcesTitle">Officiella källor från {party.name}</h2>
            <p>Kontrollerade {lastUpdated}. En källa ersätts endast när en verifierad officiell motsvarighet finns.</p>
          </div>
          <div className="sourceList">
            {party.sources.map((source) => (
              <a href={source.url} target="_blank" rel="noreferrer" key={source.url}>
                <span><b>{source.title}</b><small>{source.publishedAt ? `Publicerad ${source.publishedAt}. ` : ""}Officiell källa.</small></span>
                <i aria-hidden="true">↗</i>
              </a>
            ))}
          </div>
        </section>

        <nav className="seoNextSteps" aria-label="Fortsätt jämföra">
          <Link href={`/?view=jamfor&parties=${party.id}&compareTopic=ekonomi`}>Jämför {party.name} med andra partier</Link>
          <Link href="/partier">Se alla partier</Link>
          <Link href="/sakfragor">Se alla sakfrågor</Link>
        </nav>
      </article>
      <PublicFooter />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `https://sakfragan.nu/partier/${party.id}#webpage`,
            url: `https://sakfragan.nu/partier/${party.id}`,
            name: `${party.name}: politik och viktigaste frågor 2026`,
            description: party.overview,
            inLanguage: "sv-SE",
            dateModified: lastUpdatedIso,
            isPartOf: { "@id": "https://sakfragan.nu/#website" },
            mainEntity: {
              "@type": "Organization",
              name: party.name,
              foundingDate: String(party.founded),
              sameAs: party.sources.map((source) => source.url),
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Sakfrågan", item: "https://sakfragan.nu" },
              { "@type": "ListItem", position: 2, name: "Partier", item: "https://sakfragan.nu/partier" },
              { "@type": "ListItem", position: 3, name: party.name, item: `https://sakfragan.nu/partier/${party.id}` },
            ],
          },
        ],
      }} />
    </main>
  );
}
