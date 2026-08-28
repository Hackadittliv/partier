import Image from "next/image";
import Link from "next/link";
import BrandLogo from "./brand-logo";
import { lastUpdated, type Party } from "./data";

export function PublicHeader({ active }: { active?: "partier" | "sakfragor" | "om" }) {
  return (
    <header className="topbar publicTopbar">
      <Link className="brand" href="/" aria-label="Till Sakfrågans startsida">
        <BrandLogo />
      </Link>
      <nav aria-label="Huvudnavigering">
        <Link href="/">Sök</Link>
        <Link className={active === "sakfragor" ? "active" : ""} href="/sakfragor">Sakfrågor</Link>
        <Link className={active === "partier" ? "active" : ""} href="/partier">Partier</Link>
        <Link className={active === "om" ? "active" : ""} href="/om">Om tjänsten</Link>
      </nav>
      <span className="dateBadge"><i /> Uppdaterad {lastUpdated}</span>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="footer publicFooter">
      <Link className="brand" href="/" aria-label="Till Sakfrågans startsida">
        <BrandLogo />
      </Link>
      <p>Politik på vanlig svenska. Byggd för förståelse, inte övertalning.</p>
      <div>
        <Link href="/sakfragor">Sakfrågor</Link>
        <Link href="/partier">Partier</Link>
        <Link href="/om">Metod</Link>
      </div>
    </footer>
  );
}

export function PartyMark({ party, large = false }: { party: Party; large?: boolean }) {
  return (
    <span className={`partyEmblem${large ? " seoLarge" : ""}`} style={{ "--party": party.color } as React.CSSProperties} aria-hidden="true">
      <span>{party.short}</span>
      <Image src={party.emblem} alt="" width={large ? 76 : 46} height={large ? 76 : 46} />
    </span>
  );
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
