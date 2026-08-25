create schema if not exists sakfragan;

comment on schema sakfragan is
  'Isolerad databasavdelning för Sakfrågans källor, granskning och publicering.';

revoke all on schema sakfragan from public, anon, authenticated;
grant usage on schema sakfragan to service_role;

create or replace function sakfragan.touch_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists sakfragan.parties (
  id text primary key,
  name text not null,
  short_name text not null,
  group_name text not null check (group_name in ('riksdag', 'fler')),
  ideology text not null,
  color text not null,
  emblem_path text not null,
  official_website text,
  active boolean not null default true,
  display_order smallint not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.topics (
  id text primary key,
  label text not null,
  question text not null,
  active boolean not null default true,
  display_order smallint not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.party_profiles (
  party_id text primary key references sakfragan.parties(id) on delete restrict,
  overview text not null,
  status_label text not null,
  priorities jsonb not null default '[]'::jsonb,
  publication_status text not null default 'published'
    check (publication_status in ('draft', 'review', 'published', 'superseded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.sources (
  id uuid primary key default gen_random_uuid(),
  party_id text references sakfragan.parties(id) on delete restrict,
  source_kind text not null
    check (source_kind in ('manifesto', 'program', 'policy', 'press', 'website', 'social')),
  platform text,
  title text not null,
  canonical_url text not null unique,
  official boolean not null default true,
  active boolean not null default true,
  check_frequency text not null default 'daily'
    check (check_frequency in ('daily', 'weekly', 'manual')),
  priority smallint not null default 50 check (priority between 0 and 100),
  last_checked_at timestamptz,
  last_success_at timestamptz,
  next_check_at timestamptz,
  last_status_code integer,
  last_final_url text,
  last_content_hash text,
  consecutive_failures integer not null default 0 check (consecutive_failures >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.ingest_runs (
  id uuid primary key default gen_random_uuid(),
  trigger_kind text not null
    check (trigger_kind in ('scheduled', 'manual', 'webhook', 'backfill')),
  status text not null default 'running'
    check (status in ('running', 'succeeded', 'partial', 'failed')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  sources_total integer not null default 0,
  sources_succeeded integer not null default 0,
  sources_changed integer not null default 0,
  error_count integer not null default 0,
  details jsonb not null default '{}'::jsonb,
  constraint ingest_run_counts_nonnegative check (
    sources_total >= 0 and sources_succeeded >= 0 and sources_changed >= 0 and error_count >= 0
  )
);

create table if not exists sakfragan.collector_cursors (
  collector_key text primary key,
  platform text not null check (platform = 'x'),
  last_external_post_id text check (
    last_external_post_id is null or last_external_post_id ~ '^[0-9]+$'
  ),
  last_success_at timestamptz,
  last_run_id uuid references sakfragan.ingest_runs(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.source_snapshots (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sakfragan.sources(id) on delete restrict,
  ingest_run_id uuid references sakfragan.ingest_runs(id) on delete set null,
  external_id text,
  fetched_at timestamptz not null default now(),
  published_at timestamptz,
  title text,
  content_text text,
  content_markdown text,
  content_hash text not null,
  raw_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists sakfragan.detected_changes (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references sakfragan.sources(id) on delete restrict,
  before_snapshot_id uuid references sakfragan.source_snapshots(id) on delete set null,
  after_snapshot_id uuid not null references sakfragan.source_snapshots(id) on delete restrict,
  change_kind text not null default 'content'
    check (change_kind in ('content', 'link', 'document', 'social')),
  materiality text not null default 'unknown'
    check (materiality in ('unknown', 'minor', 'material', 'critical')),
  summary text,
  diff_text text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'ignored')),
  detected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer text,
  review_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.party_positions (
  party_id text not null references sakfragan.parties(id) on delete restrict,
  topic_id text not null references sakfragan.topics(id) on delete restrict,
  summary text not null,
  source_id uuid references sakfragan.sources(id) on delete set null,
  snapshot_id uuid references sakfragan.source_snapshots(id) on delete set null,
  evidence_excerpt text,
  publication_status text not null default 'published'
    check (publication_status in ('draft', 'review', 'published', 'superseded')),
  confidence numeric(4, 3) check (confidence is null or confidence between 0 and 1),
  valid_from date,
  valid_to date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (party_id, topic_id)
);

create table if not exists sakfragan.social_posts (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sakfragan.sources(id) on delete restrict,
  ingest_run_id uuid references sakfragan.ingest_runs(id) on delete set null,
  party_id text not null references sakfragan.parties(id) on delete restrict,
  platform text not null,
  external_post_id text not null,
  url text not null,
  author_handle text,
  author_name text,
  account_type text check (account_type is null or account_type = 'central_party'),
  body text,
  published_at timestamptz,
  collected_at timestamptz not null default now(),
  post_type text check (post_type is null or post_type in ('original', 'thread', 'quote', 'reply')),
  thread_id text,
  topic_ids text[] not null default '{}',
  statement_type text check (
    statement_type is null or statement_type in (
      'policy_position',
      'election_pledge',
      'proposal',
      'reaction',
      'government_statement',
      'campaign_message',
      'correction',
      'other'
    )
  ),
  source_query text,
  confidence numeric(4, 3) check (confidence is null or confidence between 0 and 1),
  provider text,
  model text,
  raw_evidence text,
  media_urls text[] not null default '{}',
  content_hash text,
  metrics jsonb not null default '{}'::jsonb,
  review_status text not null default 'unreviewed'
    check (review_status in ('unreviewed', 'reviewed', 'flagged', 'excluded')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (platform, external_post_id)
);

create table if not exists sakfragan.link_checks (
  id bigint generated always as identity primary key,
  source_id uuid not null references sakfragan.sources(id) on delete restrict,
  ingest_run_id uuid references sakfragan.ingest_runs(id) on delete set null,
  checked_at timestamptz not null default now(),
  status_code integer,
  final_url text,
  ok boolean not null,
  response_ms integer check (response_ms is null or response_ms >= 0),
  error_message text,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists sakfragan.review_items (
  id uuid primary key default gen_random_uuid(),
  item_kind text not null
    check (item_kind in ('change', 'position', 'social_post', 'source_error')),
  item_id uuid,
  party_id text references sakfragan.parties(id) on delete restrict,
  title text not null,
  rationale text,
  priority smallint not null default 50 check (priority between 0 and 100),
  status text not null default 'pending'
    check (status in ('pending', 'in_review', 'approved', 'rejected', 'resolved')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewer text,
  review_notes text,
  updated_at timestamptz not null default now()
);

create table if not exists sakfragan.public_updates (
  id uuid primary key default gen_random_uuid(),
  party_id text not null references sakfragan.parties(id) on delete restrict,
  change_id uuid references sakfragan.detected_changes(id) on delete set null,
  source_id uuid references sakfragan.sources(id) on delete set null,
  title text not null,
  summary text not null,
  visible boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint visible_update_has_publish_time check (not visible or published_at is not null)
);

create unique index if not exists source_snapshots_source_hash_uq
  on sakfragan.source_snapshots (source_id, content_hash);

create unique index if not exists ingest_runs_collection_slot_uq
  on sakfragan.ingest_runs ((details ->> 'collection_slot'))
  where details ? 'collection_slot';

create index if not exists sources_due_idx
  on sakfragan.sources (active, next_check_at, priority desc);

create index if not exists source_snapshots_source_fetched_idx
  on sakfragan.source_snapshots (source_id, fetched_at desc);

create index if not exists detected_changes_status_idx
  on sakfragan.detected_changes (status, materiality, detected_at desc);

create unique index if not exists detected_changes_transition_uq
  on sakfragan.detected_changes (source_id, before_snapshot_id, after_snapshot_id);

create index if not exists social_posts_party_published_idx
  on sakfragan.social_posts (party_id, published_at desc);

create index if not exists social_posts_ingest_run_idx
  on sakfragan.social_posts (ingest_run_id);

create index if not exists link_checks_source_checked_idx
  on sakfragan.link_checks (source_id, checked_at desc);

create index if not exists review_items_status_priority_idx
  on sakfragan.review_items (status, priority desc, created_at);

create unique index if not exists review_items_item_uq
  on sakfragan.review_items (item_kind, item_id)
  where item_id is not null;

create index if not exists public_updates_visible_published_idx
  on sakfragan.public_updates (visible, published_at desc);

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'parties',
    'topics',
    'party_profiles',
    'sources',
    'ingest_runs',
    'collector_cursors',
    'source_snapshots',
    'detected_changes',
    'party_positions',
    'social_posts',
    'link_checks',
    'review_items',
    'public_updates'
  ]
  loop
    execute format('alter table sakfragan.%I enable row level security', table_name);
  end loop;
end;
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'parties',
    'topics',
    'party_profiles',
    'sources',
    'ingest_runs',
    'collector_cursors',
    'source_snapshots',
    'detected_changes',
    'party_positions',
    'social_posts',
    'link_checks',
    'review_items',
    'public_updates'
  ]
  loop
    execute format(
      'drop policy if exists %I on sakfragan.%I',
      'sakfragan_clients_denied',
      table_name
    );
    execute format(
      'create policy %I on sakfragan.%I for all to anon, authenticated using (false) with check (false)',
      'sakfragan_clients_denied',
      table_name
    );
  end loop;
end;
$$;

drop trigger if exists parties_touch_updated_at on sakfragan.parties;
create trigger parties_touch_updated_at
before update on sakfragan.parties
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists topics_touch_updated_at on sakfragan.topics;
create trigger topics_touch_updated_at
before update on sakfragan.topics
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists party_profiles_touch_updated_at on sakfragan.party_profiles;
create trigger party_profiles_touch_updated_at
before update on sakfragan.party_profiles
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists sources_touch_updated_at on sakfragan.sources;
create trigger sources_touch_updated_at
before update on sakfragan.sources
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists collector_cursors_touch_updated_at on sakfragan.collector_cursors;
create trigger collector_cursors_touch_updated_at
before update on sakfragan.collector_cursors
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists detected_changes_touch_updated_at on sakfragan.detected_changes;
create trigger detected_changes_touch_updated_at
before update on sakfragan.detected_changes
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists party_positions_touch_updated_at on sakfragan.party_positions;
create trigger party_positions_touch_updated_at
before update on sakfragan.party_positions
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists social_posts_touch_updated_at on sakfragan.social_posts;
create trigger social_posts_touch_updated_at
before update on sakfragan.social_posts
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists review_items_touch_updated_at on sakfragan.review_items;
create trigger review_items_touch_updated_at
before update on sakfragan.review_items
for each row execute function sakfragan.touch_updated_at();

drop trigger if exists public_updates_touch_updated_at on sakfragan.public_updates;
create trigger public_updates_touch_updated_at
before update on sakfragan.public_updates
for each row execute function sakfragan.touch_updated_at();

revoke all on all tables in schema sakfragan from public, anon, authenticated;
revoke all on all sequences in schema sakfragan from public, anon, authenticated;
revoke execute on all functions in schema sakfragan from public, anon, authenticated;

grant select, insert, update, delete on all tables in schema sakfragan to service_role;
grant usage, select on all sequences in schema sakfragan to service_role;
grant execute on all functions in schema sakfragan to service_role;

alter default privileges for role postgres in schema sakfragan
  revoke all on tables from public, anon, authenticated;
alter default privileges for role postgres in schema sakfragan
  revoke all on sequences from public, anon, authenticated;
alter default privileges for role postgres in schema sakfragan
  revoke execute on functions from public, anon, authenticated;

alter default privileges for role postgres in schema sakfragan
  grant select, insert, update, delete on tables to service_role;
alter default privileges for role postgres in schema sakfragan
  grant usage, select on sequences to service_role;
alter default privileges for role postgres in schema sakfragan
  grant execute on functions to service_role;

comment on table sakfragan.parties is 'Partier som presenteras av Sakfrågan.';
comment on table sakfragan.sources is 'Officiella källor och sociala konton som kontrolleras löpande.';
comment on table sakfragan.collector_cursors is 'Server-only high-water marks for deterministic external source collectors.';
comment on table sakfragan.source_snapshots is 'Oföränderliga versioner av hämtat källinnehåll.';
comment on table sakfragan.detected_changes is 'Skillnader som måste bedömas innan publicering.';
comment on table sakfragan.party_positions is 'Senast granskade ståndpunkt per parti och sakområde.';
comment on table sakfragan.review_items is 'Gemensam granskningskö för mänskligt godkännande.';
