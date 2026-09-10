update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete och kostnaden för att anställa. Gör de första 15 300 kronorna i arbetsinkomst per månad skattefria, vilket enligt partiets exempel ger 1 200 kronor lägre skatt vid en månadslön på 25 000 kronor. Sänk arbetsgivaravgifterna riktat till unga och personer långt från arbetsmarknaden med målet att skapa 150 000 jobb. För personer med funktionsnedsättning vill partiet modernisera hjälpmedelslagstiftningen, stärka lönebidraget, göra LSS och socialtjänststöd vilande när någon provar arbete eller studier och göra sjuk- och aktivitetsersättningen mer flexibel. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens. Avsätt en miljard kronor årligen för att rekrytera och behålla AI forskare och entreprenörer. Sätt ett mål om minst 2,5 procents real BNP tillväxt över konjunkturcykler och låt Finanspolitiska rådet granska partiernas vallöften utifrån effekter på offentliga finanser, statsskuld och arbetade timmar. Gör det enklare att jämföra och byta bank, öka pristransparensen i djursjukvården och stärk konkurrensen i dagligvaruhandeln genom lägre trösklar för nya aktörer och enklare regler för gårdsbutiker och direktförsäljning.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Öka lokal polisnärvaro och rikta straffen mot grova brott och kriminell ekonomi. Slopa dagens mängdrabatt så att upprepade brott får fullt genomslag i straffet, samtidigt som rättskedjan ska få resurser att verkställa reformen. Kombinera detta med tidiga insatser för barn och familjer. Erbjud brottsoffer stöd inom 24 timmar och förbättra tillgången till målsägandebiträde. Reformera kontaktförbud till restriktionsområden för förövaren och tillåt elektronisk fotboja direkt vid allvarligare brott. Inför ett nationellt lämnaprogram och lämnapeng för våldsutsatta. Kriminalisera kontrollerande beteende och psykiskt våld och förenkla bodelningar för att motverka ekonomiskt våld. Stoppa permanent nedmonteringen av vägbelysning på landsbygden, ändra Trafikverkets kriterier och ersätt kommuner som betalar belysning längs statliga vägar.',
  updated_at = now()
where party_id = 'centerpartiet' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet. Fasa ut personliga elevdatorer och surfplattor i grundskolan; digitala verktyg ska användas restriktivt för tydliga pedagogiska syften och finnas kvar som hjälpmedel för elever med funktionsnedsättning. Kräv att rektorer och huvudmän ingriper när studieron brister, exempelvis med fler lärare eller särskilda stödklasser, och låt Skolinspektionen använda sanktioner när kraven inte följs. Ge legitimerade lärare och förskollärare en extra månadslön för varje år de fortsätter arbeta i stället för att gå i pension. Ta större hänsyn till små skolor, genomför ett statligt lönelyft för lärare och bygg ut yrkesutbildning i norra Sverige. Avveckla Akademiska Hus och ge lärosäten större kontroll över lokaler och möjlighet att äga fastigheter.',
  updated_at = now()
where party_id = 'liberalerna' and topic_id = 'skola';

update sakfragan.party_positions
set
  summary = 'Sänk skatten på arbete, pension och företagande, särskilt för arbetande föräldrar. Partiet anger att en vanlig familj ska få behålla 5 000 kronor mer per månad. Inför ett jobbat-avdrag för lägre skatt på arbetsrelaterade pensionsinkomster, sänk skatten för den som arbetar vidare efter pensionsåldern och motverka ålderism. Höj gränsen för skattefritt sparande på investeringssparkonto från 300 000 till 500 000 kronor och stärk arbetslinjen. Förenkla småhusbyggande genom fler bygglovsbefriade småhus, tyst godkännande för enklare tillstånd, översyn av flyttskatterna och ett mer förutsägbart tomträttssystem. Tillsätt en veterinärpriskommission som granskar regler, marknad och försäkringsbolag samt förbättrar prisjämförelser och information om billigare behandlingsalternativ.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'ekonomi';

update sakfragan.party_positions
set
  summary = 'Minska utsläpp genom teknik, elektrifiering och investeringar som bevarar konkurrenskraft. Klimatpolitiken ska vara kostnadseffektiv. Grundlagsskydda full ersättning när skogsägare inte längre kan bruka mark på grund av exempelvis en skyddad art.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Driv klimatomställningen med gröna krediter, industristöd, elektrifierade transporter och offentlig upphandling. Stärk stödet till tunga elfordon och laddinfrastruktur. Stoppa storskaligt industrifiske av sill och strömming i Östersjön, flytta ut trålgränsen permanent och värna kustfisket. Gör kollektivtrafiken avgiftsfri för barn och unga på fritiden samt för heltidsstudenter under terminerna. Ge alla skolbarn möjlighet att prova friluftsliv minst en gång per läsår, återinför reglerade friluftsdagar i skollagen och stärk anslagen till vandringsleder och fler nationalparker.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'klimat';

update sakfragan.party_positions
set
  summary = 'Höj straffen, avskaffa rabatter, bygg ut fängelser och utvisa fler utländska medborgare som begår brott. Ge polis och tull fler verktyg. Mot sexuella övergrepp mot barn vill partiet bland annat inrätta ett nationellt centrum för traumabehandling, ge polisen rätt att använda AI-baserad ansiktsigenkänning för att identifiera brottsoffer, införa ett nationellt register över dömda förövare, avskaffa preskriptionen för sexualbrott mot barn och införa en ny straffskala för synnerligen grovt barnpornografibrott.',
  updated_at = now()
where party_id = 'sverigedemokraterna' and topic_id = 'brott';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('centerpartiet', 'press', 'Förslag för fler i arbete bland personer med funktionsnedsättning', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-08-centerpartiet-150-000-fler-kan-fa-jobb---om-vi-river-hindren', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('centerpartiet', 'press', 'Förslag om stärkt stöd och skydd för brottsoffer', 'https://www.centerpartiet.se/nyheter/arkiv-2026/2026-09-09-centerpartiet-skydda-brottsoffren-begransa-forovarna', 'daily', 70, now(), '{"published_at":"2026-09-09","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('liberalerna', 'press', 'Förslag om att fasa ut personliga skärmar i grundskolan', 'https://www.liberalerna.se/nyheter/liberalerna-vill-stoppa-personliga-skarmar-i-grundskolan', 'daily', 70, now(), '{"published_at":"2026-09-09","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Förslag för enklare småhusbyggande och tryggare ägande', 'https://moderaterna.se/nyhet/tva-vanliga-loner-ska-racka-for-att-kopa-ett-hus/', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('moderaterna', 'press', 'Förslag om stärkt äganderätt för skogsägare', 'https://moderaterna.se/nyhet/m-vill-starka-aganderatten-for-skogsagare-tillsammans-med-c/', 'daily', 70, now(), '{"published_at":"2026-09-08","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Vallöfte om natur och friluftsliv', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-09-s-vallofte-alla-ska-ha-tillgang-till-sveriges-natur-och-friluftsliv', 'daily', 70, now(), '{"published_at":"2026-09-09","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('sverigedemokraterna', 'report', 'Nollvision för sexuella övergrepp mot barn', 'https://www.sd.se/wp-content/uploads/2026/09/nollvision-for-sexuella-overgrepp-mot-barn.pdf', 'daily', 80, now(), '{"published_at":"2026-09-09","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('sverigedemokraterna', 'press', 'Presentation av nollvision för sexuella övergrepp mot barn', 'https://www.sd.se/jimmie-akesson-haller-presskonferens-i-linkoping/', 'daily', 70, now(), '{"published_at":"2026-09-09","checked_at":"2026-09-10","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
