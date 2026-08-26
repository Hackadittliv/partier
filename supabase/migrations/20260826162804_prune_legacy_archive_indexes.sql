-- Archived data is never queried by the application. Remove standalone
-- indexes to reduce maintenance and advisory noise while retaining every
-- index that backs a primary key or another database constraint.

do $$
declare
  archived_index record;
begin
  for archived_index in
    select index_class.relname as index_name
    from pg_index
    join pg_class as index_class
      on index_class.oid = pg_index.indexrelid
    join pg_class as table_class
      on table_class.oid = pg_index.indrelid
    join pg_namespace as table_namespace
      on table_namespace.oid = table_class.relnamespace
    left join pg_constraint
      on pg_constraint.conindid = pg_index.indexrelid
    where table_namespace.nspname = 'idea_dump_archive'
      and pg_constraint.oid is null
  loop
    execute format(
      'drop index idea_dump_archive.%I',
      archived_index.index_name
    );
  end loop;
end
$$;
