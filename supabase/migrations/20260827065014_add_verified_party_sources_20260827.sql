update sakfragan.party_positions
set
  summary = 'Partiet vill se en bred och stabil mittenregering. Varken Vänsterpartiet eller Sverigedemokraterna ska enligt partiet ha inflytande över regeringsbildningen.',
  updated_at = now()
where party_id = 'centerpartiet'
  and topic_id = 'regering';

update sakfragan.party_profiles
set
  overview = 'Socialdemokraterna vill prioritera hushållens ekonomi, starkare välfärd, fler jobb genom industriinvesteringar, statlig närvaro i hela landet och en offensiv mot organiserad brottslighet.',
  priorities = '["Stärk hushållens ekonomi och minska ekonomiska klyftor.", "Stoppa vinstjakt i skola och förskola.", "Bekämpa gäng och kriminell ekonomi med polis och förebyggande politik.", "Stöd gröna industriinvesteringar, bostadsbyggande och ett Landsbygdslyft för fler jobb i hela landet."]'::jsonb,
  updated_at = now()
where party_id = 'socialdemokraterna';

update sakfragan.party_positions
set
  summary = 'Stärk hushåll med riktade lättnader och en mer progressiv skatt. Slut en tillväxtpakt med näringslivet och använd gröna kreditgarantier, investeringsstöd och statliga byggkrediter för fler jobb, industriinvesteringar och bostäder i hela landet.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'ekonomi';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'centerpartiet',
    'press',
    'Regeringsbesked om mittenregering',
    'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-26-annie-loof-sverige-behover-en-regering-forankrad-i-mitten',
    'daily',
    80,
    now(),
    '{"published_at":"2026-08-26","checked_at":"2026-08-27","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna',
    'press',
    'Vallöfte om ett sammanhållet Sverige',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-25-s-sverige-ska-halla-ihop',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-25","checked_at":"2026-08-27","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
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

update sakfragan.sources
set
  source_kind = 'press',
  check_frequency = 'daily',
  next_check_at = least(next_check_at, now()),
  metadata = metadata || '{"monitoring_tier":"dynamic"}'::jsonb,
  updated_at = now()
where canonical_url in (
  'https://moderaterna.se/valloften-2026/',
  'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-25-s-vallofte-fler-jobb-och-lagre-klimatutslapp'
);
