update sakfragan.party_positions
set
  summary = 'Prioritera vind, sol, vattenkraft, lagring och snabbare elnät. Pressa elnätsavgifterna, bredda det gröna avdraget för energibesparingar i hemmet och sänk elskatten långsiktigt. Partiet vill påskynda utbyggnaden av all energiproduktion och är öppet för fossilfria lösningar, medan ny kärnkraft inte är huvudspåret.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'energi';

update sakfragan.party_positions
set
  summary = 'Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet. Kräv att rektorer och huvudmän ingriper när studieron brister, exempelvis med fler lärare eller särskilda stödklasser, och låt Skolinspektionen använda sanktioner när kraven inte följs. Ge legitimerade lärare och förskollärare en extra månadslön för varje år de fortsätter arbeta i stället för att gå i pension. Ta större hänsyn till små skolor, genomför ett statligt lönelyft för lärare och bygg ut yrkesutbildning i norra Sverige. Avveckla Akademiska Hus och ge lärosäten större kontroll över lokaler och möjlighet att äga fastigheter.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff och slå mot gängens ekonomi. Gör deltagande i en kriminell sammanslutning till ett eget brott, med upp till fyra års fängelse för normalgraden, två till åtta år för grovt brott och upp till livstid för ledare. Gör jakten på grovt kriminella utomlands till en utrikespolitisk prioritering, placera fler polissambandsmän vid ambassader och stärk utlämnings- och brottsbekämpningssamarbeten med fler länder. Mot mäns våld mot kvinnor vill partiet bland annat utreda dubblerat minimistraff för grov kvinnofridskränkning, skärpa kontaktförbud, kriminalisera allvarlig spridning av kränkande deepfakes och införa en huvudregel om utvisning för utländska medborgare som döms för våld i nära relation. Stärk även skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem. Förkorta arbetstiden med bibehållen lön, stärk rätten till heltid och lagstifta mot att arbetsgivare ensidigt sänker anställdas arbetstid. Skapa 30 000 offentliga ungdomsjobb och en renoveringsfond på en miljard kronor för hyresrätter, med villkor att renoveringsstödet inte leder till hyreshöjningar. Lägg fem miljarder kronor på ett ungdomspaket som bland annat höjer studiebidragsdelen med 500 kronor i månaden och ger stöd till billigare studentbostäder. Höj taket och grundbeloppet i arbetslöshetsförsäkringen, behåll 80 procents ersättning under hela perioden, indexera ersättningen efter löneutvecklingen och återinför studerandevillkoret. Inför bindande pristransparens i veterinärvården, utred nationella tariffer och ge Konkurrensverket verktyg att bryta upp oligopol.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'ekonomi';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Förslag om lägre elräkningar', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-05-centerpartiet-vill-kapa-elrakningarna', 'daily', 70, now(), '{"published_at":"2026-09-05","checked_at":"2026-09-06","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Förslag om skyldighet att upprätthålla studiero', 'https://www.liberalerna.se/ovrigt/l-alla-skolor-ska-vara-skyldiga-att-uppratthalla-studiero-2', 'daily', 70, now(), '{"published_at":"2026-09-05","checked_at":"2026-09-06","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Förslag för att nå kriminella utomlands', 'https://moderaterna.se/nyhet/vi-ska-komma-at-fler-kriminella-utomlands/', 'daily', 70, now(), '{"published_at":"2026-09-05","checked_at":"2026-09-06","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Förslag om arbetstid och rätt till heltid', 'https://www.vansterpartiet.se/nyheter/nooshi-dadgostar-du-ska-kunna-leva-pa-din-lon/', 'daily', 70, now(), '{"published_at":"2026-09-05","checked_at":"2026-09-06","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
