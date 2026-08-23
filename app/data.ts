export type Party = {
  id: string;
  name: string;
  short: string;
  color: string;
  ideology: string;
  overview: string;
  status: "Aktuellt valmanifest" | "Aktuella vallöften" | "Valprogram publiceras löpande" | "Programmaterial granskas";
  priorities: string[];
  positions: Record<string, string>;
  sources: { title: string; url: string }[];
};

export const topics = [
  { id: "ekonomi", label: "Ekonomi och skatt", question: "Hur vill partierna förändra ekonomi och skatter?" },
  { id: "vard", label: "Vård och omsorg", question: "Hur vill partierna förändra vård och omsorg?" },
  { id: "skola", label: "Skola och familj", question: "Hur vill partierna förändra skola och familjepolitik?" },
  { id: "brott", label: "Brott och trygghet", question: "Hur vill partierna bekämpa brott och skapa trygghet?" },
  { id: "migration", label: "Migration", question: "Hur skiljer sig partiernas syn på migration och integration?" },
  { id: "klimat", label: "Klimat och natur", question: "Hur vill partierna bedriva klimat och naturpolitik?" },
  { id: "energi", label: "Energi", question: "Hur vill partierna säkra Sveriges energiförsörjning?" },
  { id: "demokrati", label: "Demokrati och EU", question: "Hur ser partierna på demokrati, EU och Sveriges roll i världen?" },
  { id: "regering", label: "Regeringsfrågan", question: "Vilken regering och vilka samarbeten vill partierna se?" },
] as const;

export const parties: Party[] = [
  {
    id: "centerpartiet", name: "Centerpartiet", short: "C", color: "#15844c", ideology: "Socialliberalt och grönt", status: "Aktuellt valmanifest",
    overview: "Centerpartiet kombinerar lägre kostnader för att anställa med stora klimatinvesteringar, stark landsbygdspolitik och liberala rättigheter.",
    priorities: ["Slopa arbetsgivaravgiften för de första tio anställda.", "Investera 50 miljarder kronor i landsbygder och lokal infrastruktur.", "Bygg ut fossilfri el, lagring och snabbare tillstånd.", "Ge fler en fast läkare och unga snabbare stöd för psykisk hälsa."],
    positions: {
      ekonomi: "Sänk skatten på arbete och kostnaden för att anställa. Små och växande företag ska få enklare regler, snabbare tillstånd och bättre tillgång till kompetens.",
      vard: "Bygg ut primärvården, ge fler en fast läkare och korta köerna. Offentliga, privata och idéburna utförare kan verka med tydliga kvalitetskrav.",
      skola: "Behåll skolvalet i en gemensam modell utan långa köer. Ge elever tidigare stöd, minska lärarnas administration och grundlagsskydda aborträtten.",
      brott: "Öka lokal polisnärvaro och rikta straffen mot grova brott och kriminell ekonomi. Kombinera detta med tidiga insatser för barn och familjer.",
      migration: "För en rättssäker migration med tydliga krav. Stoppa kompetensutvisningar och låt integration börja direkt genom svenska, praktik och arbete.",
      klimat: "Minska utsläppen genom elektrifiering, utsläppshandel, grön industri och billigare hållbara val. Jordbruk och skog ses som klimatlösning och beredskap.",
      energi: "Prioritera vind, sol, vattenkraft, lagring och snabbare elnät. Partiet är öppet för fossilfria lösningar, medan ny kärnkraft inte är huvudspåret.",
      demokrati: "Stärk liberal demokrati, integritet, oberoende medier och EU. Öka stödet till Ukraina och bygg ut militärt och civilt försvar.",
      regering: "Partiet vill byta regering men utesluter en regering med Vänsterpartiet och en regering som är beroende av Sverigedemokraterna.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://val2026.centerpartiet.se/wp-content/uploads/2026/06/Valmanifest%202026.pdf" },
      { title: "Regeringsbesked 2026", url: "https://www.centerpartiet.se/centerpartiet-lokalt/orebro-lan/orebro-lan/nyheter/nyhetsarkiv/2026-01-30-vi-tanker-aldrig-slappa-in-vansterpartiet-i-en-regering" },
    ],
  },
  {
    id: "kristdemokraterna", name: "Kristdemokraterna", short: "KD", color: "#174b87", ideology: "Kristdemokratiskt", status: "Aktuellt valmanifest",
    overview: "Kristdemokraterna prioriterar familjen, ett statligt huvudansvar för vården, ny kärnkraft och en tydligare värdegrund.",
    priorities: ["Förläng föräldraförsäkringen och låt familjer fördela dagarna friare.", "Låt staten ta huvudansvaret för sjukvården.", "Höj barnbidraget till 2 000 kronor.", "Bygg ny kärnkraft och fler småhus."],
    positions: {
      ekonomi: "Sänk skatten för hushåll och gör sparande och ägande mer lönsamt. Företag ska möta färre regler, snabbare service och bättre yrkesutbildning.",
      vard: "Avskaffa regionernas vårdansvar och låt staten ta huvudansvaret. Stärk fast läkare, vårdgaranti, psykisk hälsa, kvinnohälsa och äldres valfrihet.",
      skola: "Fokusera på kunskap, ansvar, rörelse och mindre skärmtid. Begränsa stora förskolegrupper och ge familjer längre och friare föräldraförsäkring.",
      brott: "Stärk polis, kriminalvård, kamerabevakning och skyddet för kvinnor. Kombinera tydligare straff med familjestöd och sociala insatser.",
      migration: "För en reglerad migration och kravbaserad integration. Svenska, samhällskunskap och arbete ska vara vägen till medborgarskap.",
      klimat: "Anpassa svenska klimatmål till EU:s gemensamma mål och använd teknikneutrala lösningar. Ge jordbruk, skog och gruvor bättre villkor.",
      energi: "Bygg ny kärnkraft, stärk elnäten och förenkla tillstånd. Lokalsamhällen ska få större del av intäkter från energi och naturresurser.",
      demokrati: "Stärk civilsamhället och en värdegrund byggd på kristen etik och västerländsk humanism. Bygg ett starkare militärt och civilt försvar.",
      regering: "Partiet söker förnyat mandat för en borgerlig regering och fortsatt samarbete på den nuvarande regeringssidan.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://kristdemokraterna.se/download/18.3fb0a02c1a01f5f28f7326/1787292489599/Valmanifest%202026.pdf" },
      { title: "Ideologi och principprogram", url: "https://kristdemokraterna.se/var-politik/var-politik/ideologi-och-principprogram" },
    ],
  },
  {
    id: "liberalerna", name: "Liberalerna", short: "L", color: "#1762a6", ideology: "Socialliberalt", status: "Aktuellt valmanifest",
    overview: "Liberalerna sätter skolan först och kombinerar stora skattesänkningar med starkare EU samarbete, ny kärnkraft och en stram men human migrationspolitik.",
    priorities: ["Sätt ett tak på 20 elever per klass.", "Förstatliga skolan och fasa ut vinstintresset.", "Halvera den statliga inkomstskatten.", "Förbered en folkomröstning om euron 2030."],
    positions: {
      ekonomi: "Halvera den statliga inkomstskatten på sikt, höj skattefritt sparande och sänk kostnaden för att anställa unga. Investera i utbildning, forskning och frihandel.",
      vard: "Ge alla möjlighet till en personlig fast läkare, bygg ut nära vård och stärk tandvård, psykisk vård, personlig assistans och LSS.",
      skola: "Förstatliga skolan, minska klasserna och stärk lärares auktoritet. Ge varje elev läroböcker och fasa ut vinstintresset utan att avskaffa skolvalet.",
      brott: "Stärk lokal polis, skärp straff för gängbrott och sexualbrott och bygg en finansiell elitstyrka mot kriminella nätverk.",
      migration: "Behåll en stram men human asylpolitik. Kräv svenska och samhällskunskap för medborgarskap och underlätta efterfrågad arbetskraftsinvandring.",
      klimat: "Använd EU:s utsläppshandel, elektrifiering och innovation. Skydda mer natur och förena klimatmål med konkurrenskraft.",
      energi: "Bygg ny kärnkraft och annan fossilfri energi. Investera i elnät, laddning och en robust energiförsörjning.",
      demokrati: "Inför en författningsdomstol och stärk individuella rättigheter. Fördjupa EU samarbetet och stödet till Ukraina.",
      regering: "Partiet vill fortsätta styra tillsammans med Moderaterna, Kristdemokraterna och Sverigedemokraterna.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://www.liberalerna.se/wp-content/uploads/liberalernas-valmanifest-2026-40s-komprimerad.pdf" },
      { title: "Program och rapporter", url: "https://www.liberalerna.se/politik/program-och-rapporter" },
    ],
  },
  {
    id: "miljopartiet", name: "Miljöpartiet de gröna", short: "MP", color: "#4a7d2b", ideology: "Grönt och feministiskt", status: "Aktuellt valmanifest",
    overview: "Miljöpartiet vill öka klimatinvesteringarna, minska klyftorna, stoppa vinststyrning i välfärden och bygga ett förnybart energisystem.",
    priorities: ["Inför ett nationellt kollektivtrafikkort för 499 kronor.", "Låt stora utsläppare och mycket stora förmögenheter betala mer.", "Avskaffa marknadsskolan och välfärdsvinsterna.", "Ta steg mot fyradagarsvecka med bibehållen lön."],
    positions: {
      ekonomi: "Låt offentliga klimatinvesteringar skapa jobb och beskatta stora förmögenheter och utsläpp mer. Stärk barnfamiljer och trygghetssystem.",
      vard: "Ge vård och omsorg mer resurser och prioritera primärvård, psykisk hälsa, personal och tandvård. Träng tillbaka vinstdriven styrning.",
      skola: "Avskaffa marknadsskolan och vinstuttagen. Fördela resurser efter behov, minska grupper och stärk elevstöd, kultur och ungas psykiska hälsa.",
      brott: "Kombinera lokal polis med skola, socialtjänst, vård och fritid. Bekämpa gängens ekonomi och våld mot kvinnor utan att fängsla barn.",
      migration: "Värna asylrätt och familjesammanhållning. Stoppa orimliga utvisningar av etablerade personer och bekämpa rasism och diskriminering.",
      klimat: "Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Skydda mer skog, hav och biologisk mångfald.",
      energi: "Bygg vind, sol, vattenkraft, lagring och effektivisering. Partiet avvisar ny kärnkraft och vill accelerera förnybar energi.",
      demokrati: "Försvara fria medier, kultur, forskning, minoriteter och samiska rättigheter. Stärk EU som klimataktör och fortsätt stödet till Ukraina.",
      regering: "Partiet vill se en rödgrön regering ledd av Socialdemokraterna med stark klimat och välfärdspolitik.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://www.mp.se/valmanifest2026/" },
      { title: "Partiprogram", url: "https://www.mp.se/om/partiprogram/" },
    ],
  },
  {
    id: "moderaterna", name: "Moderaterna", short: "M", color: "#2a78b8", ideology: "Liberalkonservativt", status: "Aktuella vallöften",
    overview: "Moderaterna prioriterar lägre skatt på arbete, hårdare brottsbekämpning, stram migration, valfrihet i välfärden och ett starkare försvar.",
    priorities: ["Fortsätt sänka skatten på arbete och pension.", "Stärk polis, domstolar och kriminalvård.", "Behåll en stram migrationspolitik med tydliga krav.", "Bygg ny kärnkraft och förstärk försvaret."],
    positions: {
      ekonomi: "Sänk skatten på arbete, pension och företagande. Fler ska gå från bidrag till arbete genom tydliga krav, utbildning och en starkare arbetslinje.",
      vard: "Försvara valfrihet och privata utförare med skärpt kvalitetskontroll. Korta vårdköer och prioritera kärnverksamhet framför administration.",
      skola: "Återupprätta kunskap, ordning och lärarnas auktoritet. Stärk statens kontroll av kvaliteten och behåll skolvalet.",
      brott: "Bygg ut polis, domstolar och kriminalvård. Skärp straff, slå mot gängens ekonomi och ge rättsväsendet fler verktyg.",
      migration: "Behåll en stram migrationspolitik och skärp kraven för medborgarskap, egen försörjning och integration. Utvisning ska användas mer vid brott.",
      klimat: "Minska utsläpp genom teknik, elektrifiering och investeringar som bevarar konkurrenskraft. Klimatpolitiken ska vara kostnadseffektiv.",
      energi: "Bygg ny kärnkraft, förstärk elnäten och säkra planerbar fossilfri el. Korta tillståndsprocesserna för energiinvesteringar.",
      demokrati: "Stärk försvar, Nato samarbete, EU:s säkerhet och stödet till Ukraina. Skydda rättsstat och demokratiska institutioner.",
      regering: "Partiet vill att Ulf Kristersson fortsätter som statsminister med den nuvarande regeringssidan som grund.",
    },
    sources: [
      { title: "Vallöften 2026", url: "https://moderaterna.se/valloften-2026/" },
      { title: "Politiskt handlingsprogram", url: "https://moderaterna.se/app/uploads/2025/10/Stammohandlingar2025_6oktober.pdf" },
    ],
  },
  {
    id: "socialdemokraterna", name: "Socialdemokraterna", short: "S", color: "#d82c38", ideology: "Socialdemokratiskt", status: "Aktuella vallöften",
    overview: "Socialdemokraterna vill prioritera hushållens ekonomi, starkare välfärd, fler jobb genom industriinvesteringar och en offensiv mot organiserad brottslighet.",
    priorities: ["Stärk hushållens ekonomi och minska ekonomiska klyftor.", "Stoppa vinstjakt i skola och förskola.", "Bekämpa gäng och kriminell ekonomi med polis och förebyggande politik.", "Investera i industri, energi, bostäder och infrastruktur."],
    positions: {
      ekonomi: "Stärk hushåll med riktade lättnader och en mer progressiv skatt. Investera i industri, utbildning och infrastruktur för full sysselsättning.",
      vard: "Ge välfärden mer resurser och offentlig kontroll. Korta vårdköer, stärk personalen och minska utrymmet för vinststyrning.",
      skola: "Stoppa vinstjakt i skola och förskola, öka likvärdigheten och stärk lärare, elevhälsa och tidigt stöd.",
      brott: "Slå mot maffialiknande strukturer och kriminell ekonomi med fler poliser och hårdare verktyg. Kombinera detta med socialtjänst, skola och områdespolitik.",
      migration: "Behåll en stram migrationslinje och ställ krav på svenska, arbete och integration. Samhället ska bryta segregation och trångboddhet.",
      klimat: "Driv klimatomställning genom industripolitik, elektrifiering, investeringar och nya jobb. Staten ska dela risk och skynda på omställningen.",
      energi: "Bygg ut fossilfri el genom en teknikneutral mix av kärnkraft, vind, vatten och elnät. Staten ska ta större ansvar för energiplaneringen.",
      demokrati: "Stärk demokrati, civilsamhälle och totalförsvar. Fördjupa EU samarbetet där det stärker jobb och säkerhet och fortsätt stödet till Ukraina.",
      regering: "Partiet vill leda en ny regering under Magdalena Andersson med gemensamma reformer och ett stabilt regeringsunderlag.",
    },
    sources: [
      { title: "Val 2026", url: "https://www.socialdemokraterna.se/val-2026" },
      { title: "Principer för en ny regering", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-03-magdalena-andersson-inleder-valturnen---presenterar-tre-principer-for-en-regering-ledd-av-henne" },
    ],
  },
  {
    id: "sverigedemokraterna", name: "Sverigedemokraterna", short: "SD", color: "#d8a814", ideology: "Socialkonservativt och nationalistiskt", status: "Aktuellt valmanifest",
    overview: "Sverigedemokraterna prioriterar kraftigt minskad migration, nationell sammanhållning, lägre vardagskostnader, hård kriminalpolitik och direkt regeringsmakt.",
    priorities: ["Minska asyl och anhöriginvandringen kraftigt.", "Sänk skatt på drivmedel och energi.", "Skärp straff och utvisa fler utländska brottslingar.", "Stärk försvar, tandvård och medborgarnas välfärd."],
    positions: {
      ekonomi: "Sänk skatter på drivmedel, energi och vardagskostnader. Prioritera välfärd, försvar och rättsväsende genom minskat bistånd och lägre migrationskostnader.",
      vard: "Stärk sjukvård, äldreomsorg och tandvård med fokus på tillgänglighet, personal och medborgarnas behov. Motverka fusk.",
      skola: "Stärk kunskap, svenska språket, ordning och lärarauktoritet. Skolan ska förmedla svensk kultur och motverka religiös extremism.",
      brott: "Höj straffen, avskaffa rabatter, bygg ut fängelser och utvisa fler utländska medborgare som begår brott. Ge polis och tull fler verktyg.",
      migration: "Minska asyl och anhöriginvandringen kraftigt, skärp medborgarskapskrav och använd återvandring. Integration ska bygga på svensk kultur och egen försörjning.",
      klimat: "Sänk kostnaderna för hushåll och företag och undvik svenska särkrav. Klimatpolitiken ska väga resultat mot konkurrenskraft och trygg energiförsörjning.",
      energi: "Bygg ut kärnkraft och vattenkraft, sänk elskatten och säkra ett stabilt elsystem. Lokal acceptans ska väga tungt vid vindkraft.",
      demokrati: "Stärk svensk kultur, språk och nationell suveränitet. Behåll kronan, begränsa EU:s överstatlighet och stärk Nato och försvaret.",
      regering: "Partiet vill fortsätta Tidösamarbetet men kräver större direkt makt och öppnar för att sitta i regering.",
    },
    sources: [
      { title: "Valplattform 2026", url: "https://www.sd.se/wp-content/uploads/2026/07/valplattform-2026.pdf" },
      { title: "Principprogram och dokument", url: "https://www.sd.se/vad-vi-vill/" },
    ],
  },
  {
    id: "vansterpartiet", name: "Vänsterpartiet", short: "V", color: "#b31942", ideology: "Socialistiskt och feministiskt", status: "Aktuellt valmanifest",
    overview: "Vänsterpartiet vill omfördela ekonomisk makt, stoppa vinster i välfärden, sänka hushållens kostnader och investera offentligt i jobb och klimatomställning.",
    priorities: ["Frys hyror och pressa matpriser.", "Inför skatt på miljardärers förmögenheter.", "Stoppa vinstjakt i vård, skola och omsorg.", "Förkorta arbetstiden med bibehållen lön."],
    positions: {
      ekonomi: "Beskatta stora förmögenheter och höga inkomster mer. Låt staten investera i bostäder, energi och jobb och stärk löntagare och trygghetssystem.",
      vard: "Driv välfärd efter behov utan vinstjakt. Öka statens långsiktiga finansiering och stärk fast läkare, personal, pensioner och jämlik vård.",
      skola: "Avskaffa vinstuttag, fördela resurser efter behov och stärk elevhälsa och tidigt stöd. Skolan ska minska segregation och ekonomiska skillnader.",
      brott: "Stärk polis och rättsväsende, men ge lika stor vikt åt socialtjänst, elevhälsa, fritid, arbete och avhopparstöd.",
      migration: "Värna asylrätt och rättssäkerhet. Låt integration bygga på arbete, jämlikhet och gemensam välfärd i stället för assimilering.",
      klimat: "Genomför omställningen med stora offentliga investeringar, social rättvisa och bättre kollektivtrafik. Skydda skog och biologisk mångfald.",
      energi: "Prioritera förnybar el, elnät, lagring och energieffektivisering. Partiet är kritiskt till stora satsningar på ny kärnkraft.",
      demokrati: "Stärk feminism, antirasism, fri kultur och folkrätt. Partiet är kritiskt till EU:s marknadsmakt och vill på sikt lämna Nato.",
      regering: "Partiet kräver att ingå i en rödgrön regering och vill inte släppa fram en regering som partiet självt inte sitter i.",
    },
    sources: [
      { title: "Valplattform 2026", url: "https://www.vansterpartiet.se/val2026/darfor-ska-du-rosta-pa-vansterpartiet/" },
      { title: "Partiprogram 2024", url: "https://www.vansterpartiet.se/resursbank/partiprogram/" },
    ],
  },
  {
    id: "medborgerligsamling", name: "Medborgerlig Samling", short: "MED", color: "#23466c", ideology: "Liberalkonservativt", status: "Programmaterial granskas",
    overview: "Medborgerlig Samling vill kraftigt sänka skattetrycket och den offentliga administrationen samt föra en mycket stram migrations och kriminalpolitik.",
    priorities: ["Sänk skattetrycket mot 30 procent av ekonomin.", "Avskaffa regionerna och minska offentlig administration.", "Skärp straff och utvisa utländska brottslingar.", "Bygg ut kärnkraft och lägg mer resurser på försvaret."],
    positions: {
      ekonomi: "Sänk skatter på arbete, ägande, företag och energi kraftigt. Minska myndigheter, administration, bidrag och offentliga projekt utanför kärnverksamheten.",
      vard: "Avskaffa regionerna och styr vården mer nationellt och professionellt. Minska administration och koncentrera resurser till mätbar vård och omsorg.",
      skola: "Prioritera fakta, kunskap, disciplin och lärarauktoritet. Behåll skolval och fristående alternativ, men kontrollera kvaliteten tydligt.",
      brott: "Sänk straffmyndighetsåldern, skärp straff och utvisa utländska brottslingar. Polis, domstolar och kriminalvård ska få större kapacitet.",
      migration: "Stoppa asyl och anhöriginvandring från vissa regioner, skärp medborgarskapskraven och välkomna arbetskraftsinvandring med egen försörjning.",
      klimat: "Styr efter mätbara resultat i stället för subventioner och symbolåtgärder. Värna äganderätt, jordbruk, skog och konkurrenskraft.",
      energi: "Bygg ut kärnkraft, pausa ny vindkraft och sänk energiskatter. Kommunalt veto och lokal acceptans ska väga tungt.",
      demokrati: "Stärk grundlag, yttrandefrihet, integritet och tjänstemannaansvar. Minska partistöd och omförhandla Sveriges villkor i EU.",
      regering: "Partiet fokuserar på riksdagsinträde och har ingen bindande nationell koalitionslinje för 2026.",
    },
    sources: [
      { title: "Samlad programkatalog", url: "https://med.se/politik/partiprogram" },
      { title: "Idéprogram", url: "https://med.se/politik/partiprogram/ideprogram" },
      { title: "Vård och omsorg", url: "https://med.se/politik/vard-och-omsorg" },
    ],
  },
  {
    id: "nyans", name: "Partiet Nyans", short: "PN", color: "#6f3d91", ideology: "Minoritetspolitiskt och socialt", status: "Programmaterial granskas",
    overview: "Partiet Nyans fokuserar på religionsfrihet och minoritetsskydd och kombinerar statlig välfärd med riktade lättnader för företag och grupper.",
    priorities: ["Stärk skyddet mot islamofobi, afrofobi och diskriminering.", "Förstatliga skolan och vårdens styrning.", "Frys hyror i offentligt ägda bostäder.", "Kombinera rehabilitering med högre straff för grova brott."],
    positions: {
      ekonomi: "Höj skatten för höga inkomster och ge riktade lättnader till små företag, unga och nyanlända. Avskaffa regionerna och minska upphandlingskostnader.",
      vard: "Styr vården nationellt och utan privat drift. Anställ fler sjuksköterskor, höj löner, minska administration och stärk tandvård och äldreomsorg.",
      skola: "Förstatliga skolan men tillåt fler friskolor och utförare som kan vända svaga skolor. Stärk lärare, elevstöd och modersmål.",
      brott: "Kombinera rehabilitering, utbildning och jobbgaranti för avhoppare med högre straff för grova brott. Utvisning kan användas efter grova brott.",
      migration: "Underlätta arbetskraftsinvandring och familjeåterförening under försörjningskrav. Integration ska bygga på arbete, svenska och respekt för olika kulturer.",
      klimat: "Utveckla flera fossilfria energislag, sänk drivmedelsskatt och stärk natur och skog. Klimatflyktingar ska omfattas av internationellt ansvar.",
      energi: "Acceptera kärnkraft och bygg fler reaktorer vid behov. Kombinera med vind, vatten, lagring och forskning.",
      demokrati: "Stärk religionsfrihet, minoritetsskydd och en konstitutionsdomstol. Stöd EU men inte euron eller Nato och prioritera Palestinafrågan.",
      regering: "Partiet fokuserar på riksdagsinträde och har ingen tydlig nationell regeringsstrategi publicerad för 2026.",
    },
    sources: [
      { title: "Viktigaste frågor", url: "https://www.partietnyans.se/vara-viktigaste-fragor/" },
      { title: "Politik från A till Ö", url: "https://www.partietnyans.se/var-politik/politik-a-o/" },
      { title: "Val 2026", url: "https://www.partietnyans.se/val-2026/" },
    ],
  },
  {
    id: "orebropartiet", name: "Örebropartiet", short: "ÖP", color: "#d94732", ideology: "Lokalt förankrat och systemkritiskt", status: "Valprogram publiceras löpande",
    overview: "Örebropartiet kombinerar kraftigt strypt migration och hård rättspolitik med avgiftsfri tandvård, mer resurser till äldreomsorgen och statlig kontroll över central infrastruktur.",
    priorities: ["Inför avgiftsfri tandvård i hela Sverige.", "Stryp invandringen och öka återvandringen.", "Avskaffa skatterna på el och bränsle.", "Skärp rättspolitiken och slå hårdare mot organiserad brottslighet."],
    positions: {
      ekonomi: "Slopa skatter på el och bränsle och prioritera kärnverksamhet framför bistånd, myndighetsadministration och projekt som partiet bedömer som onödiga. Staten ska äga central energiinfrastruktur.",
      vard: "Låt tandvård omfattas av högkostnadsskyddet och gör den avgiftsfri. Förstatliga ansvaret för äldreomsorgen, anställ fler, höj lönerna och ställ tydligare språk och kompetenskrav.",
      skola: "Någon fullständig nationell skolpolitik är ännu inte publicerad i valprogrammet för 2026. I det publicerade materialet vill partiet ta bort krav på hemspråksundervisning och rensa skolor från personer med kriminella kopplingar.",
      brott: "Skapa en särskild enhet mot grov organiserad brottslighet, avskaffa straffrabatter och stärk gränskontroll och kameraövervakning. Utländska grova brottslingar ska utvisas.",
      migration: "Ha noll som mål för inflödet, avskaffa asylinvandringen och stryp arbetskrafts och anhöriginvandringen. Använd återvandring och utvisning och ställ språk och försörjningskrav.",
      klimat: "Slopa den politik som partiet kallar den gröna omställningen och stoppa offentligt stöd till gröna industriprojekt. Närmiljö och naturvård ska hanteras utan att hämma energi och produktion.",
      energi: "Bygg ut statligt ägd kärnkraft och vattenkraft, förstärk elnäten och stoppa nya stora vindkraftsparker. Förstatliga elnäten och inför ett enhetligt Sverigepris på el.",
      demokrati: "Partiet beskriver sig som svårt att placera på höger och vänsterskalan och vill minska politisk byråkrati. Det vill stärka totalförsvaret, laglydigt vapenägande och direktval av nämndemän.",
      regering: "Partiet säger att det kan förhandla med alla. Det bedömer Tidösidan som enklast att få igenom politiken med, men säger sig vara berett att fälla varje regering som inte uppfyller dess avgörande vallöften.",
    },
    sources: [
      { title: "Valprogram 2026", url: "https://www.orebropartiet.se/var-politik/" },
      { title: "Riksdagen 2026", url: "https://www.orebropartiet.se/till-riksdagen/" },
      { title: "Om Örebropartiet", url: "https://www.orebropartiet.se/om-oss/" },
    ],
  },
];
