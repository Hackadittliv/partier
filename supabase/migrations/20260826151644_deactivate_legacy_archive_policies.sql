-- The archive is not exposed through PostgREST and all application grants are
-- revoked. Remove retired RLS policies so they cannot execute and so active
-- database advisories only describe Sakfragan.

do $$
declare
  archived_policy record;
  archived_table record;
begin
  for archived_policy in
    select tablename, policyname
    from pg_policies
    where schemaname = 'idea_dump_archive'
  loop
    execute format(
      'drop policy %I on idea_dump_archive.%I',
      archived_policy.policyname,
      archived_policy.tablename
    );
  end loop;

  for archived_table in
    select tablename
    from pg_tables
    where schemaname = 'idea_dump_archive'
  loop
    execute format(
      'alter table idea_dump_archive.%I disable row level security',
      archived_table.tablename
    );
  end loop;
end
$$;

revoke all on all tables in schema idea_dump_archive
  from public, anon, authenticated, service_role;
revoke all on all sequences in schema idea_dump_archive
  from public, anon, authenticated, service_role;
revoke all on schema idea_dump_archive
  from public, anon, authenticated, service_role;
