-- Verified 2026-08-25 against links or account metadata published on each
-- party's own website. Keep automatic collection disabled until the controlled
-- end-to-end test has passed.

do $$
declare
  missing_parties text[];
begin
  select array_agg(expected.id order by expected.id)
  into missing_parties
  from (
    values
      ('socialdemokraterna'),
      ('moderaterna'),
      ('sverigedemokraterna'),
      ('centerpartiet'),
      ('vansterpartiet'),
      ('kristdemokraterna'),
      ('liberalerna'),
      ('miljopartiet'),
      ('orebropartiet'),
      ('medborgerligsamling'),
      ('nyans'),
      ('alternativforsverige'),
      ('piratpartiet'),
      ('partietmod')
  ) as expected(id)
  left join sakfragan.parties party on party.id = expected.id
  where party.id is null;

  if missing_parties is not null then
    raise exception 'Missing Sakfragan parties: %', missing_parties;
  end if;
end;
$$;

with websites(party_id, official_website) as (
  values
    ('socialdemokraterna', 'https://www.socialdemokraterna.se/'),
    ('moderaterna', 'https://moderaterna.se/'),
    ('sverigedemokraterna', 'https://www.sd.se/'),
    ('centerpartiet', 'https://www.centerpartiet.se/'),
    ('vansterpartiet', 'https://www.vansterpartiet.se/'),
    ('kristdemokraterna', 'https://kristdemokraterna.se/'),
    ('liberalerna', 'https://www.liberalerna.se/'),
    ('miljopartiet', 'https://www.mp.se/'),
    ('orebropartiet', 'https://www.orebropartiet.se/'),
    ('medborgerligsamling', 'https://med.se/'),
    ('nyans', 'https://www.partietnyans.se/'),
    ('alternativforsverige', 'https://alternativforsverige.se/'),
    ('piratpartiet', 'https://piratpartiet.se/'),
    ('partietmod', 'https://partietmod.se/')
)
update sakfragan.parties as party
set official_website = websites.official_website,
    updated_at = now()
from websites
where party.id = websites.party_id
  and party.official_website is distinct from websites.official_website;

with verified_accounts(
  party_id,
  party_name,
  account_handle,
  account_url,
  verification_url,
  verification_method
) as (
  values
    ('socialdemokraterna', 'Socialdemokraterna', 'socialdemokrat', 'https://x.com/socialdemokrat', 'https://www.socialdemokraterna.se/', 'official_website_metadata'),
    ('moderaterna', 'Moderaterna', 'moderaterna', 'https://x.com/moderaterna', 'https://moderaterna.se/', 'official_website_link'),
    ('sverigedemokraterna', 'Sverigedemokraterna', 'sdriks', 'https://x.com/sdriks', 'https://www.sd.se/', 'official_website_link'),
    ('centerpartiet', 'Centerpartiet', 'centerpartiet', 'https://x.com/centerpartiet', 'https://www.centerpartiet.se/', 'official_website_metadata'),
    ('vansterpartiet', 'Vänsterpartiet', 'vansterpartiet', 'https://x.com/vansterpartiet', 'https://www.vansterpartiet.se/', 'official_website_link'),
    ('kristdemokraterna', 'Kristdemokraterna', 'kdriks', 'https://x.com/kdriks', 'https://kristdemokraterna.se/', 'official_website_link'),
    ('liberalerna', 'Liberalerna', 'liberalerna', 'https://x.com/liberalerna', 'https://www.liberalerna.se/', 'official_website_link'),
    ('miljopartiet', 'Miljöpartiet de gröna', 'miljopartiet', 'https://x.com/miljopartiet', 'https://www.mp.se/', 'official_website_link'),
    ('orebropartiet', 'Örebropartiet', 'Orebropartiet', 'https://x.com/Orebropartiet', 'https://www.orebropartiet.se/', 'official_website_link'),
    ('medborgerligsamling', 'Medborgerlig Samling', 'medborgsamling', 'https://x.com/medborgsamling', 'https://med.se/', 'official_website_link'),
    ('nyans', 'Partiet Nyans', 'PartietNyans', 'https://x.com/PartietNyans', 'https://www.partietnyans.se/', 'official_website_link'),
    ('alternativforsverige', 'Alternativ för Sverige', 'afs_riks', 'https://x.com/afs_riks', 'https://alternativforsverige.se/', 'official_website_link'),
    ('piratpartiet', 'Piratpartiet', 'piratpartiet', 'https://x.com/piratpartiet', 'https://piratpartiet.se/', 'official_website_link'),
    ('partietmod', 'Partiet MoD', 'PartietMoD', 'https://x.com/PartietMoD', 'https://partietmod.se/', 'official_website_link')
)
insert into sakfragan.sources (
  party_id,
  source_kind,
  platform,
  title,
  canonical_url,
  official,
  active,
  check_frequency,
  priority,
  metadata
)
select
  account.party_id,
  'social',
  'x',
  account.party_name || ' på X',
  account.account_url,
  true,
  true,
  'manual',
  90,
  jsonb_build_object(
    'status', 'verified',
    'platform', 'x',
    'account_type', 'central_party',
    'account_handle', account.account_handle,
    'account_url', account.account_url,
    'verification_url', account.verification_url,
    'verification_method', account.verification_method,
    'verified_at', '2026-08-25T12:29:37Z',
    'verified_by', 'manual_official_site_audit',
    'automatic_collection_enabled', false,
    'registry_version', 1
  )
from verified_accounts as account
on conflict (canonical_url) do update
set party_id = excluded.party_id,
    source_kind = excluded.source_kind,
    platform = excluded.platform,
    title = excluded.title,
    official = excluded.official,
    active = excluded.active,
    check_frequency = excluded.check_frequency,
    priority = excluded.priority,
    metadata = sakfragan.sources.metadata || excluded.metadata,
    updated_at = now();
