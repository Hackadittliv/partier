# Löpande källkontroll

Sakfrågans källkontroll består av en daglig schemalagd Netlifyfunktion, en signerad webhook för vanliga webbsidor och en separat PDF-arbetare utan Firecrawl.

## Flöde

1. `daily-source-check` hämtar aktiva källor från schemat `sakfragan`.

2. Källorna delas i två grupper. Vanliga webbsidor skickas till Firecrawl. PDF-filer hämtas direkt, jämförs med SHA-256 och texttolkas lokalt endast när filen verkligen har ändrats.

3. Firecrawl skickar ett signerat resultat för varje vanlig webbsida till `/api/firecrawl/webhook`. PDF-arbetaren körs som en Netlify Background Function via `/api/automation/pdf-check`.

4. Webhooken sparar länkstatus, innehållshash och en ny ögonblicksbild när innehållet har ändrats.

5. En faktisk innehållsändring skapar ett objekt i granskningskön. Oförändrade PDF-filer går aldrig vidare till AI eller Firecrawl.

6. Ingen partiståndpunkt publiceras automatiskt.

## Miljövariabler i Netlify

Följande hemligheter ska läggas in för funktionernas körningsmiljö i Netlify. De ska aldrig sparas i Git.

1. `SUPABASE_URL`

2. `SUPABASE_SERVICE_ROLE_KEY`

3. `FIRECRAWL_API_KEY`

4. `FIRECRAWL_WEBHOOK_SECRET`

5. `SAKFRAGAN_AUTOMATION_ENABLED`

6. `SAKFRAGAN_MANUAL_TRIGGER_SECRET`

Kostnadsspärrar:

- `FIRECRAWL_MONTHLY_CREDIT_BUDGET` — projektets hårda månadstak, standard 600 krediter.
- `FIRECRAWL_MAX_CREDITS_PER_RUN` — högsta beräknade Firecrawl-kostnad per körning, standard 50 krediter.
- `SAKFRAGAN_PDF_MAX_BYTES` — största PDF som direktarbetaren får hämta, standard 30 MB.

Connie Social använder dessutom de serverhemligheter som listas i `docs/connie-social.md`. De är separerade från Firecrawl-hemligheterna.

Sätt `SAKFRAGAN_AUTOMATION_ENABLED` till `true` först när övriga variabler är konfigurerade och schemat är exponerat i Supabase Data API. Fram till dess kan koden publiceras utan att den schemalagda kontrollen försöker starta en hämtning.

## Manuell verifiering

En behörig driftkontroll kan startas med `POST /api/automation/run` och hemligheten i ett Bearer authorization huvud. Anropet använder samma hämtning, databaslogg och signerade Firecrawl webhook som den dagliga kontrollen. Hemligheten ska bara finnas i Netlify och får aldrig skickas till webbläsarkod eller sparas i Git.

`GET /api/automation/status` med samma Bearer-hemlighet visar Firecrawl-krediter, konfigurerat tak, uppskattad X-kostnad, registrerad AI-kostnad och de senaste körningarna. Värden från leverantörens konto markeras separat från Sakfrågans egen körningslogg.

Stabila program och manifest kontrolleras normalt veckovis. Föränderliga politik-, press- och webbsidor kontrolleras dagligen. Källans `next_check_at` avgör om den faktiskt ska behandlas.

## Supabase

Lägg till `sakfragan` bland projektets exponerade scheman för Data API. Endast rollen `service_role` har databasbehörighet till schemat. Roller för anonyma och inloggade webbklienter saknar både schemaåtkomst och tabellbehörighet.

## Schema

Databasdefinitionen finns i `supabase/sakfragan_schema.sql`. Grunddata genereras från `app/data.ts` med `node scripts/generate-supabase-seed.mjs`.
