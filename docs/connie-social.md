# Connie Social via Hermes MCP

Sakfrågan använder Connie Social som en privat, serverbaserad MCP-tjänst. Webbläsaren får aldrig tillgång till MCP-token eller Supabase service role.

## Pilotflöde

1. En driftbehörig källa skickar ett verifierat X-inlägg till `POST /api/connie/social` eller högst tio inlägg till `POST /api/connie/social/batch`.

2. Netlify-funktionen kontrollerar Bearer-hemligheten och matchar kontot mot ett aktivt, officiellt och verifierat socialt konto i `sakfragan.sources`.

3. Funktionen anropar `connie_social_capabilities` och därefter `connie_social_analyze_post` eller `connie_social_analyze_batch` på Hermes MCP.

4. Connie använder Grok OAuth primärt och OpenAI OAuth som fallback. OpenRouter ligger sist endast om pilotkedjan redan innehåller den vägen.

5. Originaltexten sparas oförändrad i `sakfragan.social_posts`. Klassificering, provider, modell och usage lagras separat som metadata.

6. Ett `social_post`-objekt skapas i `sakfragan.review_items`. Ingenting publiceras automatiskt.

Endpointen accepterar inte ett konto som bara har en verifieringssymbol på X.

## X som källsystem

Grok- och OpenAI-OAuth används för analys, inte för att läsa X. Automatisk insamling använder en separat och begränsad X API v2-kollektor:

1. endast de centrala kontona med `metadata.status = verified` kan väljas,
2. sökningen använder `from:` för registret och `-is:retweet`,
3. X-svarets användarnamn måste fortfarande matcha kontoregistret,
4. första körningen tittar som standard sex timmar bakåt och efterföljande körningar använder `since_id`,
5. högst 20 poster behandlas per körning om inget lägre tak anges,
6. uppenbart opolitiskt brus filtreras med kod före AI och återstående poster analyseras i små batcher,
7. ingen post publiceras automatiskt.

Kollektorn och varje konto har varsin spärr. `CONNIE_SOCIAL_COLLECTION_ENABLED` måste vara `true` och kontot måste ha `metadata.automatic_collection_enabled = true`. Båda är avstängda när koden först driftsätts.

## Netlify-hemligheter

Lägg följande endast i Netlifys servermiljö:

1. `CONNIE_SOCIAL_ENABLED` — sätt till `true` först efter ett godkänt end-to-end-test.

2. `CONNIE_WEBHOOK_SECRET` — separat slumpad Bearer-hemlighet för den inkommande Sakfrågan-endpointen.

3. `HERMES_MCP_URL` — Hermes stabila HTTPS-adress inklusive `/mcp`.

4. `HERMES_MCP_ACCESS_TOKEN` — samma server-till-server-token som Hermes lagrar som `HERMES_MCP_SERVICE_TOKEN`.

5. `CONNIE_SOCIAL_COLLECTOR_SECRET` — separat Bearer-hemlighet för manuell dry-run eller kontrollerad insamling.

6. `X_API_BEARER_TOKEN` — app-only Bearer-token från ett godkänt X-utvecklarkonto. Detta är en källcredential och ska inte ersättas av användarens Grok-prenumeration.

7. `CONNIE_SOCIAL_COLLECTION_ENABLED` — global spärr för liveinsamling. Behåll `false` tills en dry-run och en läskörning är godkända.

Valfria kostnads- och volymgränser:

- `CONNIE_SOCIAL_X_MAX_POSTS_PER_RUN` — hårt tak, standard 20 och maximalt 100.
- `CONNIE_SOCIAL_X_MAX_POSTS_PER_DAY` — hårt dygnstak för lästa poster, standard 200.
- `CONNIE_SOCIAL_X_DAILY_BUDGET_USD` — hårt uppskattat dygnstak innan X-anropet görs, standard 1 USD.
- `CONNIE_SOCIAL_AI_BATCH_SIZE` — antal verifierade kandidater per AI-anrop, standard 8 och maximalt 10.
- `X_API_INITIAL_LOOKBACK_HOURS` — första körningens intervall, standard 6 och maximalt 168.
- `X_API_COST_USD_PER_POST`, `X_API_COST_USD_PER_USER` och `X_API_COST_USD_PER_MEDIA` — aktuella enhetspriser från X. Om något värde saknas loggas resursantalen, men uppskattningen visas som okänd i stället för ett påhittat belopp.

X kan deduplicera samma lästa resurs inom ett UTC-dygn. Därför märks den beräknade summan uttryckligen som en uppskattning före dygnsdeduplicering. Systemet begränsar anropet innan det skickas, men den debiterade källkostnaden stäms fortfarande av mot X Developer Console; Connies modellkostnad kommer separat från Hermes faktiska usage-logg.

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

## Kontrollerad aktivering

1. Lägg in `X_API_BEARER_TOKEN` och en separat `CONNIE_SOCIAL_COLLECTOR_SECRET` i Netlify.
2. Behåll `CONNIE_SOCIAL_COLLECTION_ENABLED=false` och samtliga kontons `automatic_collection_enabled=false`.
3. Kör `POST /api/connie/social/collect` med `{"dry_run":true,"max_posts":10}` och collector-hemligheten.
4. Kontrollera konton, postantal, källanrop och eventuell konfigurerad källkostnad i svaret och `ingest_runs`.
5. Aktivera därefter ett enda konto och kör en manuell livebatch med låg gräns.
6. Verifiera originaltext, Connie-modell, tokens, kostnad och väntande granskningspost.
7. Aktivera resterande konton först efter godkänt test.

Schemat anropas timvis men gör arbete endast klockan 00, 06, 12 och 18 i `Europe/Stockholm`. Från och med dagen efter valet den 13 september 2026 körs det endast klockan 06. En unik schemaplats hindrar dubbla körningar.
