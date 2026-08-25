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

alter table sakfragan.collector_cursors enable row level security;

drop policy if exists sakfragan_clients_denied on sakfragan.collector_cursors;
create policy sakfragan_clients_denied
  on sakfragan.collector_cursors
  for all
  to anon, authenticated
  using (false)
  with check (false);

drop trigger if exists collector_cursors_touch_updated_at
  on sakfragan.collector_cursors;
create trigger collector_cursors_touch_updated_at
before update on sakfragan.collector_cursors
for each row execute function sakfragan.touch_updated_at();

create unique index if not exists ingest_runs_collection_slot_uq
  on sakfragan.ingest_runs ((details ->> 'collection_slot'))
  where details ? 'collection_slot';

revoke all on sakfragan.collector_cursors from public, anon, authenticated;
grant select, insert, update, delete on sakfragan.collector_cursors to service_role;

comment on table sakfragan.collector_cursors is
  'Server-only high-water marks for deterministic external source collectors.';
