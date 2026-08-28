update sakfragan.party_positions
set
  summary = 'Stärk liberal demokrati, integritet, oberoende medier och EU. Reglera beroendeframkallande algoritmer för minderåriga, inför en åldersgräns på 15 år för sociala medier med föräldraundantag från 13 år och utred beskattning av sociala mediebolag. Öka stödet till Ukraina och bygg ut militärt och civilt försvar.',
  updated_at = now()
where party_id = 'centerpartiet'
  and topic_id = 'demokrati';

update sakfragan.party_positions
set
  summary = 'Inför en författningsdomstol och stärk individuella rättigheter. Bekämpa antisemitism genom utbildning, lokala handlingsplaner, skärpta straff för hatbrott i skolmiljö och stoppade offentliga bidrag till föreningar som sprider judehat. Fördjupa EU samarbetet och stödet till Ukraina.',
  updated_at = now()
where party_id = 'liberalerna'
  and topic_id = 'demokrati';

update sakfragan.party_positions
set
  summary = 'Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år till gång, cykel, kollektivtrafik och grönare stadsmiljöer. Skydda mer skog, hav och biologisk mångfald.',
  updated_at = now()
where party_id = 'miljopartiet'
  and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff, slå mot gängens ekonomi och ge rättsväsendet fler verktyg.',
  updated_at = now()
where party_id = 'moderaterna'
  and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Stärk hushåll med riktade lättnader och en mer progressiv skatt. Slut en tillväxtpakt med näringslivet, förstärk systemet för korttidsarbete och använd gröna kreditgarantier, investeringsstöd och statliga byggkrediter för fler jobb, industriinvesteringar och bostäder i hela landet.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Driv klimatomställningen med gröna krediter, industristöd, elektrifierade transporter och offentlig upphandling. Stärk stödet till tunga elfordon och laddinfrastruktur. Stoppa storskaligt industrifiske av sill och strömming i Östersjön, flytta ut trålgränsen permanent och värna kustfisket. Gör kollektivtrafiken avgiftsfri för barn och unga på fritiden samt för heltidsstudenter under terminerna.',
  updated_at = now()
where party_id = 'socialdemokraterna'
  and topic_id = 'klimat';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'centerpartiet',
    'press',
    'Förslag om sociala mediebolag',
    'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-27-centerpartiet-vill-begransa-sociala-mediebolagens-frihet',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-27","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'liberalerna',
    'press',
    'Förslag mot antisemitism',
    'https://www.liberalerna.se/nyheter/liberalerna-presenterar-sex-forslag-for-ett-sverige-fritt-fran-antisemitism',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-27","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'miljopartiet',
    'press',
    'Satsning på grönare städer',
    'https://www.mp.se/just-nu/mp-satsar-6-miljarder-pa-gronare-stader/',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-27","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'moderaterna',
    'press',
    'Besked om avskaffad mängdrabatt',
    'https://moderaterna.se/nyhet/mangdrabatten-ska-avskaffas-2029/',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-26","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna',
    'press',
    'Vallöfte om stärkt industrikonkurrens',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-27-s-vallofte-starkt-konkurrens-i-svensk-industri',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-27","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna',
    'press',
    'Vallöfte om Östersjöfisket',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-27-s-vallofte-stoppa-det-storskaliga-industrifisket-av-sill-och-stromming-i-ostersjon',
    'daily',
    70,
    now(),
    '{"published_at":"2026-08-27","checked_at":"2026-08-28","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
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
