update sakfragan.party_positions
set
  summary = 'Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet. Avveckla Akademiska Hus och ge lärosäten större kontroll över lokaler och möjlighet att äga fastigheter.',
  updated_at = now()
where party_id = 'liberalerna'
  and topic_id = 'skola';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'kristdemokraterna', 'program', 'Rapport om nationellt vårdansvar',
    'https://kristdemokraterna.se/download/18.3fb0a02c1a01f5f28f784d/1787748435013/21%20anledningar%20att%20avskaffa%20regionerna%201.pdf',
    'daily', 80, now(),
    '{"published_at":"2026-08-26","checked_at":"2026-08-30","imported_from":"daily_primary_source_check","monitoring_tier":"stable_pdf"}'::jsonb
  ),
  (
    'liberalerna', 'press', 'Förslag om Akademiska Hus',
    'https://www.liberalerna.se/forskning/liberalerna-vill-avveckla-akademiska-hus',
    'daily', 70, now(),
    '{"published_at":"2026-08-28","checked_at":"2026-08-30","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
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
