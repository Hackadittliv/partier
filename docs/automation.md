# Löpande källkontroll

Sakfrågans källkontroll består av en daglig schemalagd Netlifyfunktion och en signerad webhook för Firecrawl.

## Flöde

1. `daily-source-check` hämtar aktiva källor från schemat `sakfragan`.

2. Funktionen startar en asynkron Firecrawl körning för källorna.

3. Firecrawl skickar ett signerat resultat för varje sida till `/api/firecrawl/webhook`.

4. Webhooken sparar länkstatus, innehållshash och en ny ögonblicksbild när innehållet har ändrats.

5. En faktisk innehållsändring skapar ett objekt i granskningskön.

6. Ingen partiståndpunkt publiceras automatiskt.

## Miljövariabler i Netlify

Följande hemligheter ska läggas in för funktionernas körningsmiljö i Netlify. De ska aldrig sparas i Git.

1. `SUPABASE_URL`

2. `SUPABASE_SERVICE_ROLE_KEY`

3. `FIRECRAWL_API_KEY`

4. `FIRECRAWL_WEBHOOK_SECRET`

5. `SAKFRAGAN_AUTOMATION_ENABLED`

Sätt `SAKFRAGAN_AUTOMATION_ENABLED` till `true` först när övriga variabler är konfigurerade och schemat är exponerat i Supabase Data API. Fram till dess kan koden publiceras utan att den schemalagda kontrollen försöker starta en hämtning.

## Supabase

Lägg till `sakfragan` bland projektets exponerade scheman för Data API. Endast rollen `service_role` har databasbehörighet till schemat. Roller för anonyma och inloggade webbklienter saknar både schemaåtkomst och tabellbehörighet.

## Schema

Databasdefinitionen finns i `supabase/sakfragan_schema.sql`. Grunddata genereras från `app/data.ts` med `node scripts/generate-supabase-seed.mjs`.
