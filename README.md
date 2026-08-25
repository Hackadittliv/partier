# Sakfrågan

Sakfrågan gör svensk politik sökbar, jämförbar och begriplig. Tjänsten presenterar fjorton partier med samma struktur och länkar varje sammanfattning till officiella källor.

## Funktioner

1. Sök med vanliga svenska frågor

2. Filtrera på nio sakområden

3. Jämför upp till fyra partier

4. Öppna kompletta partiprofiler

5. Kontrollera aktualitet och officiella källor

6. Lägga källändringar i en mänsklig granskningskö före publicering

7. Ta emot ett manuellt verifierat X-inlägg, analysera det via Connie Social MCP och lägga resultatet i samma granskningskö

## Lokal utveckling

Installera beroenden med npm install.

Starta utvecklingsmiljön med npm run dev.

## Produktion

Netlify bygger den statiska versionen med npm run build:netlify och publicerar mappen out.

Den primära webbplatsen finns på https://sakfragan.netlify.app

## Metod

Materialet bygger på partiernas officiella program, valmanifest och politiksidor. Brytdatum för den aktuella versionen är 23 augusti 2026. Fakta, pedagogisk sammanfattning och källa hålls tydligt åtskilda.

Den löpande källkontrollen dokumenteras i `docs/automation.md`.

Connie Social-kopplingen och den spärrade X API-kollektorn dokumenteras i `docs/connie-social.md`. Automatisk X-insamling och automatisk publicering är avstängda i pilotläget.
