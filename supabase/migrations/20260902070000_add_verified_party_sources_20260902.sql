update sakfragan.party_positions
set
  summary = 'Minska utsläppen genom elektrifiering, utsläppshandel, grön industri och billigare hållbara val. Genomför en klimatplan under regeringens första 100 dagar. Målet är att 90 procent av alla nya personbilar som säljs 2030 ska vara elbilar. Inför en elbilsbonus på 50 000 kronor, bygg ut laddningen och stöd elektriska lastbilar. Skattebefria inblandade biodrivmedel efter godkännande från EU och öka andelen förnybart i tanken. Jordbruk och skog ses som klimatlösning och beredskap.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Halvera den statliga inkomstskatten på sikt, höj skattefritt sparande och sänk kostnaden för att anställa unga. Förbjud sms lån och telefonförsäljning för att motverka skuldfällor, bedrägerier och aggressiva försäljningsmetoder. Investera i utbildning, forskning och frihandel.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff och slå mot gängens ekonomi. Mot mäns våld mot kvinnor vill partiet bland annat utreda dubblerat minimistraff för grov kvinnofridskränkning, skärpa kontaktförbud, kriminalisera allvarlig spridning av kränkande deepfakes och införa en huvudregel om utvisning för utländska medborgare som döms för våld i nära relation. Stärk även skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Ge välfärden mer resurser och offentlig kontroll. Förbjud privata försäkringspatienter att ges förtur i offentligt finansierad vård, stoppa utförsäljning av akutsjukhus och motverka vinstjakt på nätläkarmarknaden. Genomför stegvis en tandvårdsreform där vuxna betalar högst 10 procent av behandlingspriset och tandvården är avgiftsfri för personer mellan 19 och 23 år. Utöka tandläkarutbildningen och styr etableringen mer efter behov.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Slå mot maffialiknande strukturer och kriminell ekonomi med fler poliser och hårdare verktyg. Inför en svensk maffialag med kollektivt straffansvar, förstärk Ekobrottsmyndigheten till en myndighet mot organiserad brottslighet och använd förverkade tillgångar till trygghetsskapande insatser. Utred mål eller krav för polisens inställelsetider med hänsyn till lokala förutsättningar. Punktmarkera unga i riskzonen och skapa ett nationellt riskfamiljsprogram. Skärp straffen för grov kvinnofridskränkning, inför möjlighet till områdesarrest för särskilt farliga män, samla brottsoffers rättigheter i en brottsofferlag och säkra tillgången till skyddade boenden. Kombinera detta med socialtjänst, skola och områdespolitik.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem. Höj taket och grundbeloppet i arbetslöshetsförsäkringen, behåll 80 procents ersättning under hela perioden, indexera ersättningen efter löneutvecklingen och återinför studerandevillkoret.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'ekonomi';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Mål om 90 procent elbilar 2030', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-9-av-10-nya-bilar-ska-vara-elbilar-2030', 'daily', 70, now(), '{"published_at":"2026-08-31","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag om skattebefriade biodrivmedel', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-mer-fossilfritt-i-tanken-utan-hogre-pris-vid-pump', 'daily', 70, now(), '{"published_at":"2026-08-31","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Förslag om förbud mot sms lån och telefonförsäljning', 'https://www.liberalerna.se/nyheter/liberalerna-forbjud-sms-lan-och-telefonforsaljning', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'manifesto', 'Valmanifest 2026', 'https://moderaterna.se/valmanifest-2026/', 'weekly', 100, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"stable"}'::jsonb),
  ('moderaterna', 'press', 'Förslag mot mäns våld mot kvinnor', 'https://moderaterna.se/nyhet/sa-ska-vi-stoppa-mans-vald-mot-kvinnor/', 'daily', 70, now(), '{"published_at":"2026-08-31","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'program', 'Valprogram 2026', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-01-s-presenterar-valprogram-for-2026', 'weekly', 100, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"stable"}'::jsonb),
  ('socialdemokraterna', 'press', 'Vallöfte om billigare tandvård för vuxna', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-01-s-gar-till-val-pa-billigare-tandvard-for-alla-vuxna', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Vallöfte om polisens inställelsetider', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-01-s-vallofte-utred-installelse---tider-for-polisen', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Förslag om stärkt arbetslöshetsförsäkring', 'https://www.vansterpartiet.se/nyheter/vansterpartiet-vill-starka-a-kassan-trygghet-nar-jobbet-forsvinner/', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-02","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
