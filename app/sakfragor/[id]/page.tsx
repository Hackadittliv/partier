import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { lastUpdated, lastUpdatedIso, partiesByFounded, topics } from "../../data";
import { JsonLd, PartyMark, PublicFooter, PublicHeader } from "../../public-shell";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return topics.map((topic) => ({ id: topic.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const topic = topics.find((item) => item.id === id);
  if (!topic) return {};
  const title = `${topic.label}: vad vill partierna 2026?`;
  const description = `${topic.question} Jämför samtliga partiers ståndpunkter och kontrollera uppgifterna mot officiella källor.`;

  return {
    title,
    description,
    alternates: { canonical: `/sakfragor/${topic.id}` },
    openGraph: { title, description, url: `/sakfragor/${topic.id}`, type: "article" },
    twitter: { title, description },
  };
}

export default async function TopicPage({ params }: PageProps) {
  const { id } = await params;
  const topic = topics.find((item) => item.id === id);
  if (!topic) notFound();

  return (
    <main>
      <PublicHeader active="sakfragor" />
      <div className="breadcrumbs sectionWrap" aria-label="Brödsmulor">
        <Link href="/">Sakfrågan</Link><span aria-hidden="true">›</span><Link href="/sakfragor">Sakfrågor</Link><span aria-hidden="true">›</span><span>{topic.label}</span>
      </div>
      <article className="topicSeoPage sectionWrap">
        <header className="topicSeoHero">
          <p className="eyebrow">Sakfråga</p>
          <h1>{topic.label}: vad vill partierna?</h1>
          <p>{topic.question} Här jämförs samtliga partier med samma frågeställning och samma källkrav.</p>
          <small>Senast granskat {lastUpdated}</small>
        </header>
        <section className="topicAnswers" aria-labelledby="answersTitle">
          <div className="seoSectionHeading">
            <p className="sectionLabel">Partiernas svar</p>
            <h2 id="answersTitle">Kort och neutralt sammanfattat</h2>
            <p>Partierna visas efter grundandeår. Texten är Sakfrågans sammanfattning. Originalmaterialet nås via den officiella källan.</p>
          </div>
          <div className="topicAnswerGrid">
            {partiesByFounded.map((party) => (
              <article key={party.id} style={{ "--party": party.color } as React.CSSProperties}>
                <header><PartyMark party={party} /><div><h3><Link href={`/partier/${party.id}`}>{party.name}</Link></h3><small>{party.status}</small></div></header>
                <p>{party.positions[topic.id]}</p>
                <div>
                  <Link href={`/partier/${party.id}#${topic.id}`}>Hela partiprofilen</Link>
                  {party.sources[0] && <a href={party.sources[0].url} target="_blank" rel="noreferrer">Officiell källa ↗</a>}
                </div>
              </article>
            ))}
          </div>
        </section>
        <nav className="seoNextSteps" aria-label="Fortsätt jämföra">
          <Link href={`/?topic=${topic.id}`}>Öppna den interaktiva sökningen</Link>
          <Link href="/sakfragor">Se alla sakfrågor</Link>
          <Link href="/partier">Se alla partier</Link>
        </nav>
      </article>
      <PublicFooter />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "WebPage",
            "@id": `https://sakfragan.nu/sakfragor/${topic.id}#webpage`,
            url: `https://sakfragan.nu/sakfragor/${topic.id}`,
            name: `${topic.label}: vad vill partierna 2026?`,
            description: topic.question,
            inLanguage: "sv-SE",
            dateModified: lastUpdatedIso,
            isPartOf: { "@id": "https://sakfragan.nu/#website" },
            mainEntity: {
              "@type": "ItemList",
              numberOfItems: partiesByFounded.length,
              itemListElement: partiesByFounded.map((party, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: party.name,
                url: `https://sakfragan.nu/partier/${party.id}#${topic.id}`,
              })),
            },
          },
          {
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Sakfrågan", item: "https://sakfragan.nu" },
              { "@type": "ListItem", position: 2, name: "Sakfrågor", item: "https://sakfragan.nu/sakfragor" },
              { "@type": "ListItem", position: 3, name: topic.label, item: `https://sakfragan.nu/sakfragor/${topic.id}` },
            ],
          },
        ],
      }} />
    </main>
  );
}
