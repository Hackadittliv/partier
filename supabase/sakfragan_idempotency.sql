create unique index if not exists detected_changes_transition_uq
  on sakfragan.detected_changes (source_id, before_snapshot_id, after_snapshot_id);

create unique index if not exists review_items_item_uq
  on sakfragan.review_items (item_kind, item_id)
  where item_id is not null;

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
