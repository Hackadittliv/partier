update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete, pension och företagande, särskilt för arbetande föräldrar. Inför ett jobbat-avdrag för lägre skatt på arbetsrelaterade pensionsinkomster, sänk skatten för den som arbetar vidare efter pensionsåldern och motverka ålderism. Höj gränsen för skattefritt sparande och stärk arbetslinjen. Tillsätt en veterinärpriskommission som granskar regler, marknad och försäkringsbolag samt förbättrar prisjämförelser och information om billigare behandlingsalternativ.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Stärk hushåll med riktade lättnader och en mer progressiv skatt. Höj inte skatten för inkomster under 70 000 kronor i månaden. Höj pensionerna för den som arbetat ett långt arbetsliv, avskaffa karensavdraget och dubbla barnbidraget inför sommar- och jullov. Pressa priser genom starkare konkurrens inom bland annat mat, bank och veterinärvård. Slut en tillväxtpakt med näringslivet, förstärk systemet för korttidsarbete och använd gröna kreditgarantier, investeringsstöd och statliga byggkrediter för fler jobb, industriinvesteringar och bostäder i hela landet. Bygg 10 000 fler studentbostäder och inför ett traineeprogram för nyexaminerade.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Stoppa vinstjakt i skola och förskola, öka likvärdigheten och stärk lärare, elevhälsa och tidigt stöd. Inför intensivsvenska på lågstadiet för elever som behöver det. Inför en kulturgaranti som ger alla barn i förskolan och grundskolan minst en kulturupplevelse per termin.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem. Höj taket och grundbeloppet i arbetslöshetsförsäkringen, behåll 80 procents ersättning under hela perioden, indexera ersättningen efter löneutvecklingen och återinför studerandevillkoret. Inför bindande pristransparens i veterinärvården, utred nationella tariffer och ge Konkurrensverket verktyg att bryta upp oligopol.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Inför fler folkomröstningar, medborgarinitiativ och tjänstemannaansvar och avskaffa riksdagsspärren. Sverige ska lämna EU och Nato, skydda yttrandefrihet och stoppa generell massövervakning. Stärk grundlagens spärrar så att regeringen inte ensam kan fatta långtgående beslut som begränsar fri- och rättigheter i en allvarlig fredstida kris. Genomför en djupare och oberoende granskning av pandemihanteringen, besluten, proportionaliteten och följderna för fri- och rättigheter. AI ska utvecklas under demokratisk kontroll och inte användas för att kontrollera människor.',
  updated_at = now()
where party_id = 'partietmod' and topic_id = 'demokrati';

update sakfragan.sources
set
  canonical_url = 'https://www.liberalerna.se/nyheter/liberalerna-ny-bonus-ska-fa-fler-larare-att-stanna-kvar-i-skolan',
  metadata = metadata || '{"checked_at":"2026-09-04","redirect_verified":true}'::jsonb,
  updated_at = now()
where canonical_url = 'https://www.liberalerna.se/nyheter/liberalerna-presenterar-ny-bonus-som-ska-fa-fler-larare-att-stanna-kvar-i-skolan';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('moderaterna', 'press', 'Förslag om jobbat-avdrag för pensionärer', 'https://moderaterna.se/nyhet/du-som-har-arbetat-ska-fa-mer-i-pension/', 'daily', 70, now(), '{"published_at":"2026-09-03","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Förslag om lägre veterinärpriser', 'https://moderaterna.se/nyhet/vi-vill-tvinga-ner-veterinarpriserna/', 'daily', 70, now(), '{"published_at":"2026-09-04","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Plånbokslöfte för hushållen', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-03-s-gar-till-val-pa-ett-planbokslofte', 'daily', 70, now(), '{"published_at":"2026-09-03","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Kulturgaranti för barn', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-03-s-vallofte-en-kulturgaranti-for-barn-i-skola-och-forskola', 'daily', 70, now(), '{"published_at":"2026-09-03","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Förslag om tariffer i veterinärvården', 'https://www.vansterpartiet.se/nyheter/veterinarpriserna-skenar-vansterpartiet-vill-infora-tariffer/', 'daily', 70, now(), '{"published_at":"2026-09-03","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('partietmod', 'press', 'Sex frågor som partiet vill lyfta i valet', 'https://partietmod.se/aktuellt/nyheter/saker-vi-inte-talar-om-i-sverige-sex-fragor-som-borde-avgora-valet/', 'daily', 70, now(), '{"published_at":"2026-09-03","checked_at":"2026-09-04","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
