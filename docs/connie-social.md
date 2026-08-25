# Connie Social via Hermes MCP

Sakfrågan använder Connie Social som en privat, serverbaserad MCP-tjänst. Webbläsaren får aldrig tillgång till MCP-token eller Supabase service role.

## Pilotflöde

1. En driftbehörig källa skickar ett enda verifierat X-inlägg till `POST /api/connie/social`.

2. Netlify-funktionen kontrollerar Bearer-hemligheten och matchar kontot mot ett aktivt, officiellt och verifierat socialt konto i `sakfragan.sources`.

3. Funktionen anropar `connie_social_capabilities` och därefter `connie_social_analyze_post` på Hermes MCP.

4. Connie använder Grok OAuth primärt och OpenAI OAuth som fallback. OpenRouter ligger sist endast om pilotkedjan redan innehåller den vägen.

5. Originaltexten sparas oförändrad i `sakfragan.social_posts`. Klassificering, provider, modell och usage lagras separat som metadata.

6. Ett `social_post`-objekt skapas i `sakfragan.review_items`. Ingenting publiceras automatiskt.

Automatisk X-sökning är avstängd. Endpointen accepterar inte ett konto som bara har en verifieringssymbol på X.

## Netlify-hemligheter

Lägg följande endast i Netlifys servermiljö:

1. `CONNIE_SOCIAL_ENABLED` — sätt till `true` först efter ett godkänt end-to-end-test.

2. `CONNIE_WEBHOOK_SECRET` — separat slumpad Bearer-hemlighet för den inkommande Sakfrågan-endpointen.

3. `HERMES_MCP_URL` — Hermes stabila HTTPS-adress inklusive `/mcp`.

4. `HERMES_MCP_ACCESS_TOKEN` — samma server-till-server-token som Hermes lagrar som `HERMES_MCP_SERVICE_TOKEN`.

Variablerna får inte heta `NEXT_PUBLIC_*` och får aldrig skrivas i Git, chatt eller logg.

## Databasuppgradering

Kör `supabase/sakfragan_connie_social.sql` i Sakfrågans Supabase-projekt innan Netlify-funktionen aktiveras. Filen utökar den befintliga `social_posts`-tabellen och behåller RLS/privilegierna låsta till `service_role`.

## Verifierat kontoregister

En social källa lagras i den befintliga tabellen `sakfragan.sources`:

- `source_kind = social`
- `platform = x`
- `canonical_url = kontots X-adress`
- `official = true`
- `active = true`
- `metadata.account_handle`
- `metadata.account_type = central_party`
- `metadata.verification_url = partiets officiella webbplats som länkar kontot`
- `metadata.verified_at`
- `metadata.status = verified`

Om handle, kontolänk eller verifieringslänk inte matchar registret returnerar endpointen `422` och inget AI-anrop görs.

## Första testet

Använd ett enda manuellt inlägg. Bekräfta efter anropet att:

1. en `ingest_runs`-rad har status `succeeded`,
2. originaltexten finns oförändrad i `social_posts`,
3. en väntande `review_items`-rad har skapats,
4. provider, modell, tokens och kostnad finns i körningens detaljer,
5. ingen `public_updates`-rad har gjorts synlig.
