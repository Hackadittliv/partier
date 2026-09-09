update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete och kostnaden för att anställa. Gör de första 15 300 kronorna i arbetsinkomst per månad skattefria, vilket enligt partiets exempel ger 1 200 kronor lägre skatt vid en månadslön på 25 000 kronor. Sänk arbetsgivaravgifterna riktat till unga och personer långt från arbetsmarknaden med målet att skapa 150 000 jobb. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens. Avsätt en miljard kronor årligen för att rekrytera och behålla AI forskare och entreprenörer. Sätt ett mål om minst 2,5 procents real BNP tillväxt över konjunkturcykler och låt Finanspolitiska rådet granska partiernas vallöften utifrån effekter på offentliga finanser, statsskuld och arbetade timmar. Gör det enklare att jämföra och byta bank, öka pristransparensen i djursjukvården och stärk konkurrensen i dagligvaruhandeln genom lägre trösklar för nya aktörer och enklare regler för gårdsbutiker och direktförsäljning.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete, pension och företagande, särskilt för arbetande föräldrar. Partiet anger att en vanlig familj ska få behålla 5 000 kronor mer per månad. Inför ett jobbat-avdrag för lägre skatt på arbetsrelaterade pensionsinkomster, sänk skatten för den som arbetar vidare efter pensionsåldern och motverka ålderism. Höj gränsen för skattefritt sparande på investeringssparkonto från 300 000 till 500 000 kronor och stärk arbetslinjen. Tillsätt en veterinärpriskommission som granskar regler, marknad och försäkringsbolag samt förbättrar prisjämförelser och information om billigare behandlingsalternativ.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem. Förkorta arbetstiden med bibehållen lön, stärk rätten till heltid och lagstifta mot att arbetsgivare ensidigt sänker anställdas arbetstid. Avskaffa karensavdraget, höj och prisindexera barnbidraget och höj pensionsavgiften till 18,5 procent. Skapa 30 000 offentliga ungdomsjobb och en renoveringsfond på en miljard kronor för hyresrätter, med villkor att renoveringsstödet inte leder till hyreshöjningar. Lägg fem miljarder kronor på ett ungdomspaket som bland annat höjer studiebidragsdelen med 500 kronor i månaden och ger stöd till billigare studentbostäder. Höj taket och grundbeloppet i arbetslöshetsförsäkringen, behåll 80 procents ersättning under hela perioden, indexera ersättningen efter löneutvecklingen och återinför studerandevillkoret. Inför bindande pristransparens i veterinärvården, utred nationella tariffer och ge Konkurrensverket verktyg att bryta upp oligopol.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Driv välfärd efter behov utan vinstjakt. Avskaffa den tvingande lagen om valfrihetssystem i primärvården, tillsätt en avprivatiseringskommission, stoppa privata sjukvårdsförsäkringar i offentligt finansierad vård och begränsa nätläkarbolagens ersättning. Öka statens långsiktiga finansiering genom att räkna upp statsbidragen efter inflation, löner, befolkning och behov och stärk fast läkare, personal, pensioner och jämlik vård. Återställ läkemedlens högkostnadsskydd. Inför ett tandvårdsskydd efter samma princip som sjukvårdens högkostnadsskydd och gör tandvården avgiftsfri för personer mellan 19 och 23 år.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Avskaffa vinstuttag och fördela resurser efter behov. Reglera klasstorlekar, förskolans gruppstorlek och bemanning samt bemanningen i elevhälsa och fritidshem nationellt. Skolan ska ge tidigt stöd och minska segregation och ekonomiska skillnader.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Stärk Riksbankens roll, beskatta stora förmögenheter, kapital och bankövervinster mer och inför en stegvis basinkomst. Sänk skatten på låga och normala inkomster och sprid ägande och inflytande genom personalägande, kooperativ och medlemsbanker. Skydda kontanter och hushållens sparande från spekulation.',
  updated_at = now()
where party_id = 'partietmod' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Partiet vill återta nationell kontroll över gränspolitiken genom ett svenskt EU utträde. Integrationen ska förena krav på språk, egen försörjning och laglydnad med en väg till medborgarskap och delaktighet. Partiet förespråkar frivillig återvandring och rättssäkert prövad utvisning efter allvarliga brott när Sveriges åtaganden medger det.',
  updated_at = now()
where party_id = 'partietmod' and topic_id = 'migration';

update sakfragan.party_positions
set
  summary = 'Inför fler folkomröstningar, medborgarinitiativ och tjänstemannaansvar och avskaffa riksdagsspärren. 50 000 underskrifter ska kunna kräva en nationell folkomröstning och 100 000 ska kunna väcka en fråga om grundlagsändring. Sverige ska lämna EU och Nato, skydda yttrandefrihet och stoppa generell massövervakning. Stärk grundlagens spärrar så att regeringen inte ensam kan fatta långtgående beslut som begränsar fri- och rättigheter i en allvarlig fredstida kris. Genomför en djupare och oberoende granskning av pandemihanteringen, besluten, proportionaliteten och följderna för fri- och rättigheter. Offentlig AI ska vara granskningsbar, ha tydligt mänskligt ansvar och minska beroendet av slutna leverantörer.',
  updated_at = now()
where party_id = 'partietmod' and topic_id = 'demokrati';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Plan för jobb och tillväxt', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-08-centerpartiets-plan-for-jobb-och-tillvaxt', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-09","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Besked om sänkt skatt och höjt skattefritt ISK', 'https://moderaterna.se/nyhet/hart-arbetande-svenskar-ska-fa-behalla-mer-pengar-i-planboken/', 'daily', 70, now(), '{"checked_at":"2026-09-09","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'manifesto', 'Valmanifest 2026', 'https://www.vansterpartiet.se/wp-content/uploads/2026/09/Valmanifest_2026_WEBB-2.pdf', 'daily', 80, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-09","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Presentation av valmanifest och pensionsförslag', 'https://www.vansterpartiet.se/nyheter/vansterpartiet-presenterar-valmanifest-vill-hoja-pensionerna/', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-09","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('partietmod', 'press', 'Besked om självbestämmande och ekonomisk demokrati', 'https://partietmod.se/aktuellt/nyheter/darfor-mod-sjalvbestammande-frihet-och-ekonomisk-demokrati/', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-09","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
