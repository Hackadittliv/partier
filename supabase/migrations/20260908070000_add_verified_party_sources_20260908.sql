update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete och kostnaden för att anställa. Gör de första 15 300 kronorna i arbetsinkomst per månad skattefria, vilket enligt partiets exempel ger 1 200 kronor lägre skatt vid en månadslön på 25 000 kronor. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens. Avsätt en miljard kronor årligen för att rekrytera och behålla AI forskare och entreprenörer. Gör det enklare att jämföra och byta bank, öka pristransparensen i djursjukvården och stärk konkurrensen i dagligvaruhandeln genom lägre trösklar för nya aktörer och enklare regler för gårdsbutiker och direktförsäljning.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Öka lokal polisnärvaro och rikta straffen mot grova brott och kriminell ekonomi. Slopa dagens mängdrabatt så att upprepade brott får fullt genomslag i straffet, samtidigt som rättskedjan ska få resurser att verkställa reformen. Kombinera detta med tidiga insatser för barn och familjer. Kriminalisera kontrollerande beteende och psykiskt våld och förenkla bodelningar för att motverka ekonomiskt våld. Stoppa permanent nedmonteringen av vägbelysning på landsbygden, ändra Trafikverkets kriterier och ersätt kommuner som betalar belysning längs statliga vägar.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Stärk lokal polis, skärp straff för gängbrott och sexualbrott och bygg en finansiell elitstyrka mot kriminella nätverk. Inför en lag om särskilda provokativa åtgärder som bland annat låter polisen utge sig för att vara barn under 15 år för att identifiera misstänkta sexualbrottslingar, använda fiktiva övergreppsbilder i slutna forum och arbeta med dolda fordonsuppgifter. Åtgärderna ska vara proportionerliga, av synnerlig vikt för utredningen och beslutas av åklagare.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff och slå mot gängens ekonomi. Gör deltagande i en kriminell sammanslutning till ett eget brott, med upp till fyra års fängelse för normalgraden, två till åtta år för grovt brott och upp till livstid för ledare. Gör jakten på grovt kriminella utomlands till en utrikespolitisk prioritering, placera fler polissambandsmän vid ambassader och stärk utlämnings- och brottsbekämpningssamarbeten med fler länder. Inför en lag om särskilda provokativa åtgärder som bland annat låter polisen utge sig för att vara barn i chattforum och använda fiktiva övergreppsbilder för att identifiera misstänkta sexualbrottslingar, samt använda motsvarande metoder mot gäng. Åtgärderna ska beslutas av åklagare. Mot mäns våld mot kvinnor vill partiet bland annat utreda dubblerat minimistraff för grov kvinnofridskränkning, skärpa kontaktförbud, kriminalisera allvarlig spridning av kränkande deepfakes och införa en huvudregel om utvisning för utländska medborgare som döms för våld i nära relation. Tillsätt dessutom en haverikommission varje gång en kvinna mördas, följ upp kommissionens åtgärdsförslag skarpare och analysera hur de snabbare kan genomföras. Stärk även skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Ge välfärden mer resurser och offentlig kontroll. Indexera de generella statsbidragen så att statens tillskott till skola, vård och omsorg ökar i takt med inflationen. Förbjud privata försäkringspatienter att ges förtur i offentligt finansierad vård, stoppa utförsäljning av akutsjukhus och motverka vinstjakt på nätläkarmarknaden. Genomför stegvis en tandvårdsreform där vuxna betalar högst 10 procent av behandlingspriset och tandvården är avgiftsfri för personer mellan 19 och 23 år. Utred en eller två nya tandläkar- och tandhygienistutbildningar i norra Sverige och fler platser vid befintliga utbildningar. Utred basår eller introduktion för nyutexaminerade, kräv att privata kliniker bidrar till verksamhetsförlagd utbildning och inför skyddad yrkestitel för tandsköterskor.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Stärk grundlagar, offentlighetsprincip, direktdemokrati och ett fritt internet. Reformera personnumret så att det inte visar kön, ålder eller härkomst och ge varje myndighet en egen identitetskod. Begränsa den kommersiella upphovsrätten till fem år med möjlighet till förlängning upp till tjugo år, utan att ändra den ideella rätten. Kräv att offentlig data kan flyttas mellan leverantörer och inrätta en IT haverikommission som löpande granskar informationssäkerheten. Reformera EU mot större insyn, ett starkare parlament och tydligare demokratisk kontroll.',
  updated_at = now()
where party_id = 'piratpartiet' and topic_id = 'demokrati';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Besked om slopad mängdrabatt', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-07-centerpartiet-vill-slopa-mangdrabatten---sahar-resonerade-vi-om-regeringens-forslag', 'daily', 70, now(), '{"published_at":"2026-09-07","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag för stärkt konsumentmakt', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-08-centerpartiet-ge-konsumenterna-mer-makt', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Regeringsförslag om nya polisiära verktyg', 'https://www.liberalerna.se/nyheter/regeringen-nya-verktyg-for-att-bekampa-sexualbrott-mot-barn', 'daily', 70, now(), '{"published_at":"2026-09-07","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Regeringsförslag om särskilda provokativa åtgärder', 'https://moderaterna.se/nyhet/nu-skyddar-vi-barnen-mot-pedofiler/', 'daily', 70, now(), '{"published_at":"2026-09-07","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Vallöfte om inflationssäkrade statsbidrag till välfärden', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-07-m-och-sd-gar-till-val-pa-nedskarningar-motsvarande-nastan-30-000-underskoterskor', 'daily', 70, now(), '{"published_at":"2026-09-07","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('piratpartiet', 'press', 'Tre valförslag om identitet, upphovsrätt och informationssäkerhet', 'https://piratpartiet.se/nyheter/tre-anledningar-att-rosta-pirat-2026/', 'daily', 70, now(), '{"published_at":"2026-09-06","checked_at":"2026-09-08","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
on conflict (canonical_url) do update set
  party_id = excluded.party_id,
  source_kind = excluded.source_kind,
  title = excluded.title,
  check_frequency = excluded.check_frequency,
  priority = excluded.priority,
  next_check_at = least(sakfragan.sources.next_check_at, excluded.next_check_at),
  metadata = sakfragan.sources.metadata || excluded.metadata,
  active = true,
  official = true,
  updated_at = now();
