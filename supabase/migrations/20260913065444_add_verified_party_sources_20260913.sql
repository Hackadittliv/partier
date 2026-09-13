update sakfragan.party_positions
set
  summary = 'För en rättssäker migration med tydliga krav. Ta bort lönegolvet på 34 450 kronor för arbetskraftsinvandring och ersätt det med kollektivavtalsenlig eller branschpraxisbaserad lön. Permanent uppehållstillstånd ska fortsätta vara permanent och ett särskilt startupvisum ska införas. Stoppa kompetensutvisningar, även när de beror på små eller obetydliga fel från arbetsgivaren, och låt integration börja direkt genom svenska, praktik och arbete.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'migration';

update sakfragan.party_positions
set
  summary = 'Fokusera på kunskap, ansvar, rörelse och mindre skärmtid. Begränsa förskolans grupper till 12 barn för de yngsta och 15 för de äldre, trygga drygt 13 000 anställda och avsätt en halv miljard kronor till mer svensk mat. Ge familjer längre och friare föräldraförsäkring.',
  updated_at = now()
where party_id = 'kristdemokraterna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Återupprätta Miljödepartementet, inrätta ett klimatkabinett under statsministern och skapa en tioårig klimatfond för bland annat järnväg, elektrifiering, energieffektivisering och klimatanpassning. Återuppta planeringen av nya stambanor i södra Sverige, höj anslagen till järnvägsunderhåll, återta underhållet i statlig regi, ge järnvägen en egen myndighet och inför en nollvision för tågförseningar. Ge tågresenärer automatisk och mer generös ersättning vid förseningar och inställda avgångar. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år. Ta fram en nationell textilstrategi, gör reparation och second hand billigare och kräv minst 20 procent återvunnet material i ny textil senast 2035. Freda kustzonen ut till 12 sjömil från industrifiske, skärp kraven på minskat näringsläckage och investera 3,3 miljarder kronor i hav, vatten och restaurering. Skydda mer skog, hav och biologisk mångfald.',
  updated_at = now()
where party_id = 'miljopartiet' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Stoppa vinstjakt i skola och förskola, öka likvärdigheten och stärk lärare, elevhälsa och tidigt stöd. Inrätta en nationell kriskommission för skolan under regeringens första 100 dagar, förbjud värdeöverföringar och inför senast 2028 bindande regler om högst 12 elever per lärare i lågstadiet. Inför en nollvision mot bristande läskunnighet, skriv in daglig läsning i kursplanerna och ge sanktioner till skolor som använder obehöriga lärare trots att behöriga finns att tillgå. Inför intensivsvenska på lågstadiet för elever som behöver det. Inför en kulturgaranti som ger alla barn i förskolan och grundskolan minst en kulturupplevelse per termin.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Driv välfärd efter behov utan vinstjakt. Avskaffa den tvingande lagen om valfrihetssystem i primärvården, tillsätt en avprivatiseringskommission, stoppa privata sjukvårdsförsäkringar i offentligt finansierad vård och begränsa nätläkarbolagens ersättning. Öka statens långsiktiga finansiering genom att räkna upp statsbidragen efter inflation, löner, befolkning och behov och stärk fast läkare, personal, pensioner och jämlik vård. Avskaffa karensavdraget, se över rehabiliteringskedjan och stärk sjukförsäkringen så att målet är att 80 procent av löntagarna kan få 80 procent av lönen, med ersättningar som följer löne- och prisutvecklingen. Återställ läkemedlens högkostnadsskydd. Inför ett tandvårdsskydd efter samma princip som sjukvårdens högkostnadsskydd och gör tandvården avgiftsfri för personer mellan 19 och 23 år.',
  updated_at = now()
where party_id = 'vansterpartiet' and topic_id = 'vard';

update sakfragan.party_positions
set
  summary = 'Utred skattesystemet i grunden, förbättra villkoren för små och innovativa företag och inför en basinkomst på existensminimum för alla invånare mellan 19 och 64 år som ersätter delar av dagens trygghetssystem. Data och kunskap ses som centrala ekonomiska resurser.',
  updated_at = now()
where party_id = 'piratpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Stärk lärarnas profession, forskningsanknytningen och elevernas rätt till stöd, hälsa och medbestämmande. Ge lärare och rektorer större frihet att utforma undervisning och organisation samt mer tid och stöd för kompetens- och karriärutveckling. Resurser ska följa ansvar och behov.',
  updated_at = now()
where party_id = 'piratpartiet' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Prioritera brott med offer. Avkriminalisera eget drogbruk och köp av cannabis samt legalisera produktion och försäljning i en särskilt reglerad modell. Inför fristående granskning av polis och åklagare, återinför tjänstemannaansvar och begränsa övervakning till konkret misstanke.',
  updated_at = now()
where party_id = 'piratpartiet' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Stärk grundlagar, offentlighetsprincip, direktdemokrati och ett fritt internet. Sverige ska ha digitalt oberoende genom att offentlig drift, lagring och infrastruktur ligger i svenska eller europeiska händer, och partiet vill att Sverige motsätter sig Chat Control i EU:s ministerråd. Reformera personnumret så att det inte visar kön, ålder eller härkomst och ge varje myndighet en egen identitetskod. Begränsa den kommersiella upphovsrätten till fem år med möjlighet till förlängning upp till tjugo år, utan att ändra den ideella rätten. Kräv att offentlig data kan flyttas mellan leverantörer och inrätta en IT haverikommission som löpande granskar informationssäkerheten. Reformera EU mot större insyn, ett starkare parlament och tydligare demokratisk kontroll.',
  updated_at = now()
where party_id = 'piratpartiet' and topic_id = 'demokrati';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Besked om arbetskraftsinvandring och kompetensutvisningar', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-11-centerpartiet-slar-fast-den-som-anstranger-sig-ska-inte-utvisas', 'daily', 70, now(), '{"published_at":"2026-09-11","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('kristdemokraterna', 'press', 'Förslag om mindre barngrupper i förskolan', 'https://kristdemokraterna.se/arkiv/nyheter/2026/2026-09-10-minskade-barngrupper-i-forskolan', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('miljopartiet', 'press', 'Vallöfte om en renässans för järnvägen', 'https://www.mp.se/just-nu/miljopartiet-lovar-en-renassans-for-jarnvagen/', 'daily', 70, now(), '{"published_at":"2026-09-07","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('miljopartiet', 'press', 'Tre vallöften för klimatet', 'https://www.mp.se/just-nu/mp-presenterar-tre-valloften-for-klimatet/', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Plan för att vända skolresultaten', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-10-socialdemokraternas-plan-for-att-vanda-skolresultaten', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Förslag om fler behöriga lärare och stärkt läskunnighet', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-11-fler-behoriga-larare-och-nollvision-mot-bristande-laskunnighet', 'daily', 70, now(), '{"published_at":"2026-09-11","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('vansterpartiet', 'press', 'Förslag om att rusta upp sjukförsäkringen', 'https://www.vansterpartiet.se/nyheter/vansterpartiet-vi-ska-rusta-upp-sjukforsakringen-efter-valet/', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('piratpartiet', 'press', 'Tre valförslag om basinkomst, cannabis och skola', 'https://piratpartiet.se/nyheter/tre-anledningar-att-rosta-pirat-2026-2/', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('piratpartiet', 'press', 'Partiledarbesked om digitalt oberoende och Chat Control', 'https://piratpartiet.se/nyheter/fem-snabba-lila-med-mikael-enmalm/', 'daily', 70, now(), '{"published_at":"2026-09-10","checked_at":"2026-09-13","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
