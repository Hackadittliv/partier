update sakfragan.party_positions
set
  summary = 'Bygg ut primärvården och garantera en fast läkare på den vårdcentral patienten väljer. Skapa fler utbildningsplatser och små lokala mottagningar, lagstadga rätt till fortbildning och säkra kontakt med vårdcentralen samma dag.',
  updated_at = now()
where party_id = 'centerpartiet'
  and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år. Ta fram en nationell textilstrategi, gör reparation och second hand billigare och kräv minst 20 procent återvunnet material i ny textil senast 2035. Skydda mer skog, hav och biologisk mångfald.',
  updated_at = now()
where party_id = 'miljopartiet'
  and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff, slå mot gängens ekonomi och stärk skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna'
  and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Ge välfärden mer resurser och offentlig kontroll. Förbjud privata försäkringspatienter att ges förtur i offentligt finansierad vård, stoppa utförsäljning av akutsjukhus och motverka vinstjakt på nätläkarmarknaden.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Stoppa vinstjakt i skola och förskola, öka likvärdigheten och stärk lärare, elevhälsa och tidigt stöd. Inför intensivsvenska på lågstadiet för elever som behöver det.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Behåll en stram migrationslinje och ställ krav på svenska, arbete och integration. Höj kvaliteten i SFI, begränsa distansundervisningen och bygg ut utbildningar som kombinerar svenska med ett yrke.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'migration';

update sakfragan.party_positions
set
  summary = 'Inför fler folkomröstningar, medborgarinitiativ och tjänstemannaansvar och avskaffa riksdagsspärren. Sverige ska lämna EU och Nato, skydda yttrandefrihet och stoppa generell massövervakning. AI ska utvecklas under demokratisk kontroll och inte användas för att kontrollera människor.',
  updated_at = now()
where party_id = 'partietmod'
  and topic_id = 'demokrati';

update sakfragan.sources
set
  title = 'Förslag om sociala mediebolag',
  canonical_url = 'https://www.centerpartiet.se/centerpartiet-lokalt/uppsala-lan/uppsala/nyheter/nyhetsarkiv---uppsala/2026-08-28-centerpartiet-vill-starka-skyddet-for-barn-och-unga-pa-sociala-medier',
  next_check_at = now(),
  metadata = metadata || '{"published_at":"2026-08-28","checked_at":"2026-08-29","replaces_unavailable_url":"https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-27-centerpartiet-vill-begransa-sociala-mediebolagens-frihet"}'::jsonb,
  updated_at = now()
where canonical_url = 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-27-centerpartiet-vill-begransa-sociala-mediebolagens-frihet';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'centerpartiet', 'press', 'Besked om fast läkare',
    'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-28-centerpartiet-vill-sakra-ratten-till-fast-lakare',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'miljopartiet', 'press', 'Strategi för hållbara textilier',
    'https://www.mp.se/just-nu/129984/',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'moderaterna', 'press', 'Regeringsbesked om skydd för barn',
    'https://moderaterna.se/nyhet/vi-star-pa-barnens-sida/',
    'daily', 70, now(),
    '{"checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna', 'press', 'Vallöfte om ny språkpolitik',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-28-s-vallofte-en-ny-sprakpolitik',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna', 'press', 'Vallöfte om vård efter behov',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-28-s-vallofte-vard-ska-ges-efter-behov-inte-planbok',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'partietmod', 'press', 'Politiska besked i partiledardebatt',
    'https://partietmod.se/aktuellt/nyheter/gustaf-rydelius-i-partiledardebatt-det-ar-inte-socialism-det-ar-oligarki/',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-29","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  )
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
