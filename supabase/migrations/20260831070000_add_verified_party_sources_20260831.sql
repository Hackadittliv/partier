update sakfragan.party_positions
set
  summary = 'Använd EU:s utsläppshandel, elektrifiering och innovation. Skapa 10 till 15 accelerationszoner för fossilfri industri, sänk skatten på el till fordonsladdning och bredda avdraget för grön teknik. Skydda mer natur och förena klimatmål med konkurrenskraft.',
  updated_at = now()
where party_id = 'liberalerna'
  and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Bygg ny kärnkraft och annan fossilfri energi. Inför en permanent kärnkraftspremie till värdkommuner och investera i elnät, laddning och en robust energiförsörjning.',
  updated_at = now()
where party_id = 'liberalerna'
  and topic_id = 'energi';

update sakfragan.party_positions
set
  summary = 'Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år. Ta fram en nationell textilstrategi, gör reparation och second hand billigare och kräv minst 20 procent återvunnet material i ny textil senast 2035. Freda kustzonen ut till 12 sjömil från industrifiske, skärp kraven på minskat näringsläckage och investera 3,3 miljarder kronor i hav, vatten och restaurering. Skydda mer skog, hav och biologisk mångfald.',
  updated_at = now()
where party_id = 'miljopartiet'
  and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Slå mot maffialiknande strukturer och kriminell ekonomi med fler poliser och hårdare verktyg. Skärp straffen för grov kvinnofridskränkning, inför möjlighet till områdesarrest för särskilt farliga män, samla brottsoffers rättigheter i en brottsofferlag och säkra tillgången till skyddade boenden. Kombinera detta med socialtjänst, skola och områdespolitik.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Partiet fokuserar på riksdagsinträde och har ingen bindande nationell koalitionslinje för 2026. Det är öppet för valtekniskt samarbete med andra partier och har kandidater från Enhet på sin riksdagslista.',
  updated_at = now()
where party_id = 'partietmod'
  and topic_id = 'regering';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'liberalerna', 'press', 'Fem klimatlöften för fossilfri tillväxt',
    'https://www.liberalerna.se/klimat/fossilfri-tillvaxt-liberalernas-klimatpolitik-for-ett-rikare-och-friare-sverige',
    'daily', 70, now(),
    '{"published_at":"2026-08-30","checked_at":"2026-08-31","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'miljopartiet', 'press', 'Östersjöpaket för ett levande hav',
    'https://www.mp.se/just-nu/miljopartiet-presenterar-ostersjopaket-ostersjon-har-inte-rad-att-vanta/',
    'daily', 70, now(),
    '{"published_at":"2026-08-17","checked_at":"2026-08-31","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna', 'press', 'Fem reformer mot mäns våld mot kvinnor',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-30-s-gar-till-val-pa-fem-reformer-for-att-bekampa-mans-vald-mot-kvinnor',
    'daily', 70, now(),
    '{"published_at":"2026-08-30","checked_at":"2026-08-31","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'partietmod', 'press', 'Besked om valtekniskt samarbete',
    'https://partietmod.se/aktuellt/nyheter/varfor-samarbetar-inte-mod-med-andra-smapartier-for-att-komma-in-i-riksdagen/',
    'daily', 70, now(),
    '{"published_at":"2026-08-30","checked_at":"2026-08-31","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
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
