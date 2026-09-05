update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete och kostnaden för att anställa. Gör de första 15 300 kronorna i arbetsinkomst per månad skattefria, vilket enligt partiets exempel ger 1 200 kronor lägre skatt vid en månadslön på 25 000 kronor. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens. Avsätt en miljard kronor årligen för att rekrytera och behålla AI forskare och entreprenörer.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Bygg ut primärvården och garantera en fast läkare på den vårdcentral patienten väljer. Skapa fler utbildningsplatser och små lokala mottagningar, lagstadga rätt till fortbildning och säkra kontakt med vårdcentralen samma dag. Stärk LSS och personlig assistans, indexera assistansersättningen efter faktiska kostnader och samla huvudansvaret för personlig assistans hos staten.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Öka lokal polisnärvaro och rikta straffen mot grova brott och kriminell ekonomi. Kombinera detta med tidiga insatser för barn och familjer. Kriminalisera kontrollerande beteende och psykiskt våld och förenkla bodelningar för att motverka ekonomiskt våld. Stoppa permanent nedmonteringen av vägbelysning på landsbygden, ändra Trafikverkets kriterier och ersätt kommuner som betalar belysning längs statliga vägar.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'För en rättssäker migration med tydliga krav. Ta bort lönegolvet på 34 450 kronor för arbetskraftsinvandring och ersätt det med kollektivavtalsenlig eller branschpraxisbaserad lön. Permanent uppehållstillstånd ska fortsätta vara permanent och ett särskilt startupvisum ska införas. Stoppa kompetensutvisningar och låt integration börja direkt genom svenska, praktik och arbete.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'migration';

update sakfragan.party_positions
set
  summary = 'Halvera den statliga inkomstskatten på sikt, höj skattefritt sparande och sänk kostnaden för att anställa unga. Förbjud sms lån och telefonförsäljning för att motverka skuldfällor, bedrägerier och aggressiva försäljningsmetoder. Avveckla den arbetsmarknadspolitiska tjänsten Rusta och matcha under nästa mandatperiod. Investera i utbildning, forskning och frihandel. För norra Sverige vill partiet korta tillståndstider, stärka lokala företag, säkra regionalflyg och statlig service samt färdigställa Norrbotniabanan och stärka Malmbanan och Ostkustbanan.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet. Ge legitimerade lärare och förskollärare en extra månadslön för varje år de fortsätter arbeta i stället för att gå i pension. Ta större hänsyn till små skolor, genomför ett statligt lönelyft för lärare och bygg ut yrkesutbildning i norra Sverige. Avveckla Akademiska Hus och ge lärosäten större kontroll över lokaler och möjlighet att äga fastigheter.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Bygg ny kärnkraft och annan fossilfri energi. Inför en permanent kärnkraftspremie till värdkommuner och investera i elnät, laddning och en robust energiförsörjning. Partiet är positivt till små modulära reaktorer i norra Sverige och vill möjliggöra fler gruvor och mer mineralförädling, men motsätter sig alunskifferbrytning och vill ge kommunerna veto mot sådan brytning.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'energi';

update sakfragan.party_positions
set
  summary = 'Låt offentliga klimatinvesteringar skapa jobb och beskatta stora förmögenheter och utsläpp mer. Inför en skatt på förmögenheter över en miljard kronor, som partiet beräknar kan ge mer än 50 miljarder kronor per år. Öka Industriklivet med tre miljarder kronor årligen och använd gröna skatteavdrag och kreditgarantier för industrins omställning. Stärk barnfamiljer och trygghetssystem.',
  updated_at = now()
where party_id = 'miljopartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Ge tågresenärer automatisk och mer generös ersättning vid förseningar och inställda avgångar. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år. Ta fram en nationell textilstrategi, gör reparation och second hand billigare och kräv minst 20 procent återvunnet material i ny textil senast 2035. Freda kustzonen ut till 12 sjömil från industrifiske, skärp kraven på minskat näringsläckage och investera 3,3 miljarder kronor i hav, vatten och restaurering. Skydda mer skog, hav och biologisk mångfald.',
  updated_at = now()
where party_id = 'miljopartiet' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem. Skapa 30 000 offentliga ungdomsjobb och en renoveringsfond på en miljard kronor för hyresrätter, med villkor att renoveringsstödet inte leder till hyreshöjningar. Lägg fem miljarder kronor på ett ungdomspaket som bland annat höjer studiebidragsdelen med 500 kronor i månaden och ger stöd till billigare studentbostäder. Höj taket och grundbeloppet i arbetslöshetsförsäkringen, behåll 80 procents ersättning under hela perioden, indexera ersättningen efter löneutvecklingen och återinför studerandevillkoret. Inför bindande pristransparens i veterinärvården, utred nationella tariffer och ge Konkurrensverket verktyg att bryta upp oligopol.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Driv välfärd efter behov utan vinstjakt. Avskaffa den tvingande lagen om valfrihetssystem i primärvården, tillsätt en avprivatiseringskommission, stoppa privata sjukvårdsförsäkringar i offentligt finansierad vård och begränsa nätläkarbolagens ersättning. Öka statens långsiktiga finansiering och stärk fast läkare, personal, pensioner och jämlik vård. Återinför avgiftsfri tandvård för unga och låt staten betala hela tandvårdskostnaden över 1 400 kronor under en tolvmånadersperiod.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Genomför omställningen med stora offentliga investeringar, social rättvisa och bättre kollektivtrafik. Inför ett rikstäckande kollektivtrafikkort för 450 kronor i månaden för vuxna och 225 kronor för unga, pensionärer och studenter. Skydda skog och biologisk mångfald.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'klimat';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Vallöften för stärkt konkurrenskraft', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-04-centerpartiet-presenterar-valloften-for-att-starka-sveriges-konkurrenskraft', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag inom funktionsrättspolitiken', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-04-centerpartiets-funktionsrattspolitik', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag mot mäns våld mot kvinnor', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-04-mans-vald-mot-kvinnor-maste-stoppas-med-centerpartiets-forslag-for-att-bade-forebygga-och-straffa', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Förslag för ett lyft för norra Sverige', 'https://www.liberalerna.se/nyheter/liberalerna-vill-skapa-ett-lyft-for-norra-sverige', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('miljopartiet', 'press', 'Förslag om miljardärsskatt', 'https://www.mp.se/just-nu/ett-rattvisare-skattesystem-kraver-miljardarsskatt/', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('miljopartiet', 'press', 'Vallöfte för industrins omställning', 'https://www.mp.se/just-nu/miljopartiet-presenterar-vallofte-for-industrins-omstallning/', 'daily', 70, now(), '{"published_at":"2026-09-01","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('miljopartiet', 'press', 'Bättre ersättning till tågresenärer', 'https://www.mp.se/just-nu/mp-lovar-tagresenarer-battre-ersattning/', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Ungdomspaket för studerande och unga', 'https://www.vansterpartiet.se/nyheter/vansterpartiet-presenterar-ungdomspaketet-5-miljarder-for-studerande-och-unga/', 'daily', 70, now(), '{"published_at":"2026-08-26","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Investeringspaket för förorten', 'https://www.vansterpartiet.se/nyheter/investera-i-fororten-jobb-bostader-och-framtidstro-i-hela-sverige/', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-05","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
