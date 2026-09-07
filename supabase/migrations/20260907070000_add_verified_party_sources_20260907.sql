update sakfragan.party_positions
set
  summary = 'Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff och slå mot gängens ekonomi. Gör deltagande i en kriminell sammanslutning till ett eget brott, med upp till fyra års fängelse för normalgraden, två till åtta år för grovt brott och upp till livstid för ledare. Gör jakten på grovt kriminella utomlands till en utrikespolitisk prioritering, placera fler polissambandsmän vid ambassader och stärk utlämnings- och brottsbekämpningssamarbeten med fler länder. Mot mäns våld mot kvinnor vill partiet bland annat utreda dubblerat minimistraff för grov kvinnofridskränkning, skärpa kontaktförbud, kriminalisera allvarlig spridning av kränkande deepfakes och införa en huvudregel om utvisning för utländska medborgare som döms för våld i nära relation. Tillsätt dessutom en haverikommission varje gång en kvinna mördas, följ upp kommissionens åtgärdsförslag skarpare och analysera hur de snabbare kan genomföras. Stärk även skyddet för barn mot sexuella kränkningar och barnpornografibrott.',
  updated_at = now()
where party_id = 'moderaterna' and topic_id = 'brott';

update sakfragan.party_positions
set
  summary = 'Ge välfärden mer resurser och offentlig kontroll. Förbjud privata försäkringspatienter att ges förtur i offentligt finansierad vård, stoppa utförsäljning av akutsjukhus och motverka vinstjakt på nätläkarmarknaden. Genomför stegvis en tandvårdsreform där vuxna betalar högst 10 procent av behandlingspriset och tandvården är avgiftsfri för personer mellan 19 och 23 år. Utred en eller två nya tandläkar- och tandhygienistutbildningar i norra Sverige och fler platser vid befintliga utbildningar. Utred basår eller introduktion för nyutexaminerade, kräv att privata kliniker bidrar till verksamhetsförlagd utbildning och inför skyddad yrkestitel för tandsköterskor.',
  updated_at = now()
where party_id = 'socialdemokraterna' and topic_id = 'vard';

insert into sakfragan.sources (
  party_id, source_kind, title, canonical_url, check_frequency, priority,
  next_check_at, metadata
)
values
  ('moderaterna', 'press', 'Vallöfte om haverikommission vid dödligt våld mot kvinnor', 'https://moderaterna.se/nyhet/ingen-kvinna-ska-mordas-av-en-man/', 'daily', 70, now(), '{"checked_at":"2026-09-07","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb),
  ('socialdemokraterna', 'press', 'Förslag för tandvårdens kompetensförsörjning', 'https://www.socialdemokraterna.se/nyheter/nyheter/2026-09-06-s-vill-sakra-tandvard-i-hela-landet', 'daily', 70, now(), '{"published_at":"2026-09-06","checked_at":"2026-09-07","imported_from":"daily_primary_source_check","monitoring_tier":"dynamic"}'::jsonb)
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
