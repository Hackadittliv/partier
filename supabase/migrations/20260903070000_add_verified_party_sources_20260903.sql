update sakfragan.party_positions
set
  summary = 'Behåll skolvalet i en gemensam modell utan långa köer. Ge elever tidigare stöd, minska lärarnas administration och grundlagsskydda aborträtten. För elever med neuropsykiatriska funktionsnedsättningar vill partiet ha fler behöriga lärare, mer specialpedagogisk kompetens, mindre klasser där stödbehoven är stora, yrkesprov som alternativ väg till yrkesprogram och en utbyggd elevhälsa.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Öka lokal polisnärvaro och rikta straffen mot grova brott och kriminell ekonomi. Kombinera detta med tidiga insatser för barn och familjer. Stoppa permanent nedmonteringen av vägbelysning på landsbygden, ändra Trafikverkets kriterier och ersätt kommuner som betalar belysning längs statliga vägar.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Halvera den statliga inkomstskatten på sikt, höj skattefritt sparande och sänk kostnaden för att anställa unga. Förbjud sms lån och telefonförsäljning för att motverka skuldfällor, bedrägerier och aggressiva försäljningsmetoder. Avveckla den arbetsmarknadspolitiska tjänsten Rusta och matcha under nästa mandatperiod. Investera i utbildning, forskning och frihandel.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet. Ge legitimerade lärare och förskollärare en extra månadslön för varje år de fortsätter arbeta i stället för att gå i pension. Avveckla Akademiska Hus och ge lärosäten större kontroll över lokaler och möjlighet att äga fastigheter.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff och slå mot gängens ekonomi. Gör deltagande i en kriminell sammanslutning till ett eget brott, med upp till fyra års fängelse för normalgraden, två till åtta år för grovt brott och upp till livstid för ledare. Mot mäns våld mot kvinnor vill partiet bland annat utreda dubblerat minimistraff för grov kvinnofridskränkning, skärpa kontaktförbud, kriminalisera allvarlig spridning av kränkande deepfakes och införa en huvudregel om utvisning för utländska medborgare som döms för våld i nära relation. Stärk även skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Inför fler folkomröstningar, medborgarinitiativ och tjänstemannaansvar och avskaffa riksdagsspärren. Sverige ska lämna EU och Nato, skydda yttrandefrihet och stoppa generell massövervakning. Stärk grundlagens spärrar så att regeringen inte ensam kan fatta långtgående beslut som begränsar fri- och rättigheter i en allvarlig fredstida kris. AI ska utvecklas under demokratisk kontroll och inte användas för att kontrollera människor.',
  updated_at = now()
where party_id = 'partietmod' and topic_id = 'demokrati';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Förslag för elever med NPF', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-02-npf-elever-sviks-i-skolan---centerpartiet-vill-se-forandring', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag om vägbelysning på landsbygden', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-02-stoppa-nedslackningen-av-landsbygdens-vagar---centerpartiets-forslag', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Bonus för lärare som arbetar vidare', 'https://www.liberalerna.se/nyheter/liberalerna-presenterar-ny-bonus-som-ska-fa-fler-larare-att-stanna-kvar-i-skolan', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Besked om att avveckla Rusta och matcha', 'https://www.liberalerna.se/nyheter/liberalerna-vill-skrota-centerpartiets-privatiseringsexperiment-2', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Förslag om straffbart deltagande i gäng', 'https://moderaterna.se/nyhet/det-ska-vara-straffbart-att-delta-i-gang/', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('partietmod', 'press', 'Grundlagsupprop om demokratiska spärrar i kris', 'https://partietmod.se/aktuellt/nyheter/nu-startar-grundlagsuppropet-skriv-under-for-att-skydda-demokratin-aven-i-kris/', 'daily', 70, now(), '{"published_at":"2026-09-02","checked_at":"2026-09-03","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
