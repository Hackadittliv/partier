update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete och kostnaden för att anställa. Gör de första 15 300 kronorna i arbetsinkomst per månad skattefria, vilket enligt partiets exempel ger 1 200 kronor lägre skatt vid en månadslön på 25 000 kronor. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Minska utsläppen genom elektrifiering, utsläppshandel, grön industri och billigare hållbara val. Genomför en klimatplan under regeringens första 100 dagar med fler elbilar och hållbara drivmedel, snabbare tillstånd, stöd till industrins och lantbrukets omställning samt klimatanpassning. Jordbruk och skog ses som klimatlösning och beredskap.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Stärk hushåll med riktade lättnader och en mer progressiv skatt. Slut en tillväxtpakt med näringslivet, förstärk systemet för korttidsarbete och använd gröna kreditgarantier, investeringsstöd och statliga byggkrediter för fler jobb, industriinvesteringar och bostäder i hela landet. Bygg 10 000 fler studentbostäder och inför ett traineeprogram för nyexaminerade.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Ge välfärden mer resurser och offentlig kontroll. Förbjud privata försäkringspatienter att ges förtur i offentligt finansierad vård, stoppa utförsäljning av akutsjukhus och motverka vinstjakt på nätläkarmarknaden. Gör tandvården avgiftsfri för unga.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Slå mot maffialiknande strukturer och kriminell ekonomi med fler poliser och hårdare verktyg. Inför en svensk maffialag med kollektivt straffansvar, förstärk Ekobrottsmyndigheten till en myndighet mot organiserad brottslighet och använd förverkade tillgångar till trygghetsskapande insatser. Punktmarkera unga i riskzonen och skapa ett nationellt riskfamiljsprogram. Skärp straffen för grov kvinnofridskränkning, inför möjlighet till områdesarrest för särskilt farliga män, samla brottsoffers rättigheter i en brottsofferlag och säkra tillgången till skyddade boenden. Kombinera detta med socialtjänst, skola och områdespolitik.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Driv välfärd efter behov utan vinstjakt. Avskaffa den tvingande lagen om valfrihetssystem i primärvården, tillsätt en avprivatiseringskommission, stoppa privata sjukvårdsförsäkringar i offentligt finansierad vård och begränsa nätläkarbolagens ersättning. Öka statens långsiktiga finansiering och stärk fast läkare, personal, pensioner och jämlik vård.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'vard';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  (
    'centerpartiet', 'press', 'Klimatplan för de första 100 dagarna',
    'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-presenterar-klimatplan-infor-valet',
    'daily', 70, now(),
    '{"published_at":"2026-08-31","checked_at":"2026-09-01","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'centerpartiet', 'press', 'Förslag om skattefri grundlön',
    'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-31-centerpartiet-vill-sanka-skatten-mest-for-den-som-tjanar-minst',
    'daily', 70, now(),
    '{"published_at":"2026-08-31","checked_at":"2026-09-01","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna', 'press', 'Offensiv mot organiserad brottslighet',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-31-s-vallofte-offensiv-mot-den-organiserade-brottsligheten',
    'daily', 70, now(),
    '{"published_at":"2026-08-31","checked_at":"2026-09-01","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'socialdemokraterna', 'press', 'Studentpaket för unga',
    'https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-31-s-vallofte-studentpaket-med-battre---ekonomi-for-studenter-och-unga',
    'daily', 70, now(),
    '{"published_at":"2026-08-31","checked_at":"2026-09-01","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
  ),
  (
    'vansterpartiet', 'press', 'Plan mot gräddfiler i vården',
    'https://www.vansterpartiet.se/nyheter/stoppa-graddfilerna-i-varden-den-som-behover-vard-mest-ska-fa-den-forst/',
    'daily', 70, now(),
    '{"published_at":"2026-08-31","checked_at":"2026-09-01","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb
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
