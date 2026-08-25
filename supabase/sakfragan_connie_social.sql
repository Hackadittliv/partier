alter table sakfragan.social_posts
  add column if not exists ingest_run_id uuid references sakfragan.ingest_runs(id) on delete set null,
  add column if not exists author_handle text,
  add column if not exists account_type text,
  add column if not exists post_type text,
  add column if not exists thread_id text,
  add column if not exists topic_ids text[] not null default '{}',
  add column if not exists statement_type text,
  add column if not exists source_query text,
  add column if not exists confidence numeric(4, 3),
  add column if not exists provider text,
  add column if not exists model text,
  add column if not exists raw_evidence text,
  add column if not exists media_urls text[] not null default '{}';

alter table sakfragan.social_posts
  alter column published_at drop not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'social_posts_account_type_check'
      and conrelid = 'sakfragan.social_posts'::regclass
  ) then
    alter table sakfragan.social_posts
      add constraint social_posts_account_type_check
      check (account_type is null or account_type = 'central_party');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'social_posts_post_type_check'
      and conrelid = 'sakfragan.social_posts'::regclass
  ) then
    alter table sakfragan.social_posts
      add constraint social_posts_post_type_check
      check (post_type is null or post_type in ('original', 'thread', 'quote', 'reply'));
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'social_posts_statement_type_check'
      and conrelid = 'sakfragan.social_posts'::regclass
  ) then
    alter table sakfragan.social_posts
      add constraint social_posts_statement_type_check
      check (
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
      );
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'social_posts_confidence_check'
      and conrelid = 'sakfragan.social_posts'::regclass
  ) then
    alter table sakfragan.social_posts
      add constraint social_posts_confidence_check
      check (confidence is null or confidence between 0 and 1);
  end if;
end;
$$;

create index if not exists social_posts_ingest_run_idx
  on sakfragan.social_posts (ingest_run_id);

revoke all on sakfragan.social_posts from public, anon, authenticated;
grant select, insert, update, delete on sakfragan.social_posts to service_role;

comment on column sakfragan.sources.metadata is
  'Sociala källor använder account_handle, account_type, verification_url, verified_at och status=verified som kontoregister.';
