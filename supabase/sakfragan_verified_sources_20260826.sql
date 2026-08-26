insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority, metadata
)
values (
  'socialdemokraterna',
  'manifesto',
  'Vallöfte om jobb och klimat',
  'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-25-s-vallofte-fler-jobb-och-lagre-klimatutslapp',
  'daily',
  90,
  '{"published_at":"2026-08-25","checked_at":"2026-08-26","imported_from":"daily_primary_source_check"}'::jsonb
)
on conflict (canonical_url) do update set
  party_id = excluded.party_id,
  source_kind = excluded.source_kind,
  title = excluded.title,
  check_frequency = excluded.check_frequency,
  priority = excluded.priority,
  metadata = sakfragan.sources.metadata || excluded.metadata,
  active = true,
  official = true;

update sakfragan.party_profiles
set
  overview = 'Moderaterna prioriterar stärkt familjeekonomi, lägre skatt på arbete, hårdare brottsbekämpning, stram migration, valfrihet i välfärden och ett starkare försvar.',
  priorities = '["Sänk skatten för arbetande föräldrar och avskaffa avgiften för förskola och fritidshem.", "Stärk polis, domstolar och kriminalvård.", "Behåll en stram migrationspolitik med tydliga krav.", "Bygg ny kärnkraft och förstärk försvaret."]'::jsonb
where party_id = 'moderaterna';

update sakfragan.party_positions
set summary = 'Sänk skatten på arbete, pension och företagande, särskilt för arbetande föräldrar. Höj gränsen för skattefritt sparande och stärk arbetslinjen.'
where party_id = 'moderaterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set summary = 'Återupprätta kunskap, ordning och lärarnas auktoritet. Stärk statens kvalitetskontroll, behåll skolvalet och avskaffa avgiften för förskola och fritidshem.'
where party_id = 'moderaterna' and topic_id = 'skola';

update sakfragan.party_profiles
set priorities = '["Stärk hushållens ekonomi och minska ekonomiska klyftor.", "Stoppa vinstjakt i skola och förskola.", "Bekämpa gäng och kriminell ekonomi med polis och förebyggande politik.", "Slut en tillväxtpakt med näringslivet för fler jobb, investeringar och lägre utsläpp."]'::jsonb
where party_id = 'socialdemokraterna';

update sakfragan.party_positions
set summary = 'Stärk hushåll med riktade lättnader och en mer progressiv skatt. Slut en tillväxtpakt med näringslivet och investera i industri, utbildning och infrastruktur för fler jobb.'
where party_id = 'socialdemokraterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set summary = 'Driv klimatomställningen med gröna krediter, industristöd, elektrifierade transporter och offentlig upphandling. Gör kollektivtrafiken avgiftsfri för barn och unga på fritiden samt för heltidsstudenter under terminerna.'
where party_id = 'socialdemokraterna' and topic_id = 'klimat';
