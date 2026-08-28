export type Party = {
  id: string;
  name: string;
  short: string;
  color: string;
  emblem: string;
  group: "riksdag" | "fler";
  founded: number;
  ideology: string;
  overview: string;
  status: "Aktuellt valmanifest" | "Aktuella vallöften" | "Valprogram publiceras löpande" | "Programmaterial granskas";
  priorities: string[];
  positions: Record<string, string>;
  sources: { title: string; url: string; publishedAt?: string }[];
};

export const lastUpdated = "28 augusti 2026";
export const electionDate = "13 september 2026";

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
    id: "centerpartiet", name: "Centerpartiet", short: "C", color: "#15844c", emblem: "/emblems/centerpartiet.svg", group: "riksdag", founded: 1910, ideology: "Socialliberalt och grönt", status: "Aktuellt valmanifest",
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
      demokrati: "Stärk liberal demokrati, integritet, oberoende medier och EU. Reglera beroendeframkallande algoritmer för minderåriga, inför en åldersgräns på 15 år för sociala medier med föräldraundantag från 13 år och utred beskattning av sociala mediebolag. Öka stödet till Ukraina och bygg ut militärt och civilt försvar.",
      regering: "Partiet vill se en bred och stabil mittenregering. Varken Vänsterpartiet eller Sverigedemokraterna ska enligt partiet ha inflytande över regeringsbildningen.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://val2026.centerpartiet.se/wp-content/uploads/2026/06/Valmanifest-2026.pdf" },
      { title: "Regeringsbesked 2026", url: "https://www.centerpartiet.se/centerpartiet-lokalt/orebro-lan/orebro-lan/nyheter/nyhetsarkiv/2026-01-30-vi-tanker-aldrig-slappa-in-vansterpartiet-i-en-regering" },
      { title: "Regeringsbesked om mittenregering", url: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-26-annie-loof-sverige-behover-en-regering-forankrad-i-mitten", publishedAt: "26 augusti 2026" },
      { title: "Förslag om sociala mediebolag", url: "https://www.centerpartiet.se/nyheter/arkiv-2026/2026-08-27-centerpartiet-vill-begransa-sociala-mediebolagens-frihet", publishedAt: "27 augusti 2026" },
    ],
  },
  {
    id: "kristdemokraterna", name: "Kristdemokraterna", short: "KD", color: "#174b87", emblem: "/emblems/kristdemokraterna.svg", group: "riksdag", founded: 1964, ideology: "Kristdemokratiskt", status: "Aktuellt valmanifest",
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
      { title: "Ideologi och principprogram", url: "https://kristdemokraterna.se/var-politik/ideologi-och-principprogram" },
    ],
  },
  {
    id: "liberalerna", name: "Liberalerna", short: "L", color: "#1762a6", emblem: "/emblems/liberalerna.png", group: "riksdag", founded: 1934, ideology: "Socialliberalt", status: "Aktuellt valmanifest",
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
      demokrati: "Inför en författningsdomstol och stärk individuella rättigheter. Bekämpa antisemitism genom utbildning, lokala handlingsplaner, skärpta straff för hatbrott i skolmiljö och stoppade offentliga bidrag till föreningar som sprider judehat. Fördjupa EU samarbetet och stödet till Ukraina.",
      regering: "Partiet vill fortsätta styra tillsammans med Moderaterna, Kristdemokraterna och Sverigedemokraterna.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://www.liberalerna.se/wp-content/uploads/liberalernas-valmanifest-2026-40s-komprimerad.pdf" },
      { title: "Program och rapporter", url: "https://www.liberalerna.se/program-och-rapporter" },
      { title: "Förslag mot antisemitism", url: "https://www.liberalerna.se/nyheter/liberalerna-presenterar-sex-forslag-for-ett-sverige-fritt-fran-antisemitism", publishedAt: "27 augusti 2026" },
    ],
  },
  {
    id: "miljopartiet", name: "Miljöpartiet de gröna", short: "MP", color: "#4a7d2b", emblem: "/emblems/miljopartiet.png", group: "riksdag", founded: 1981, ideology: "Grönt och feministiskt", status: "Aktuellt valmanifest",
    overview: "Miljöpartiet vill öka klimatinvesteringarna, minska klyftorna, stoppa vinststyrning i välfärden och bygga ett förnybart energisystem.",
    priorities: ["Inför ett nationellt kollektivtrafikkort för 499 kronor.", "Låt stora utsläppare och mycket stora förmögenheter betala mer.", "Avskaffa marknadsskolan och välfärdsvinsterna.", "Ta steg mot fyradagarsvecka med bibehållen lön."],
    positions: {
      ekonomi: "Låt offentliga klimatinvesteringar skapa jobb och beskatta stora förmögenheter och utsläpp mer. Stärk barnfamiljer och trygghetssystem.",
      vard: "Ge vård och omsorg mer resurser och prioritera primärvård, psykisk hälsa, personal och tandvård. Träng tillbaka vinstdriven styrning.",
      skola: "Avskaffa marknadsskolan och vinstuttagen. Fördela resurser efter behov, minska grupper och stärk elevstöd, kultur och ungas psykiska hälsa.",
      brott: "Kombinera lokal polis med skola, socialtjänst, vård och fritid. Bekämpa gängens ekonomi och våld mot kvinnor utan att fängsla barn.",
      migration: "Värna asylrätt och familjesammanhållning. Stoppa orimliga utvisningar av etablerade personer och bekämpa rasism och diskriminering.",
      klimat: "Fasa snabbt ut fossila bränslen, gör utsläpp dyrare och hållbara val billigare. Återinför stadsmiljöavtalen med 1,5 miljarder kronor per år till gång, cykel, kollektivtrafik och grönare stadsmiljöer. Skydda mer skog, hav och biologisk mångfald.",
      energi: "Bygg vind, sol, vattenkraft, lagring och effektivisering. Partiet avvisar ny kärnkraft och vill accelerera förnybar energi.",
      demokrati: "Försvara fria medier, kultur, forskning, minoriteter och samiska rättigheter. Stärk EU som klimataktör och fortsätt stödet till Ukraina.",
      regering: "Partiet vill se en rödgrön regering ledd av Socialdemokraterna med stark klimat och välfärdspolitik.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://www.mp.se/valmanifest2026/" },
      { title: "Partiprogram", url: "https://www.mp.se/om/partiprogram/" },
      { title: "Satsning på grönare städer", url: "https://www.mp.se/just-nu/mp-satsar-6-miljarder-pa-gronare-stader/", publishedAt: "27 augusti 2026" },
    ],
  },
  {
    id: "moderaterna", name: "Moderaterna", short: "M", color: "#2a78b8", emblem: "/emblems/moderaterna.png", group: "riksdag", founded: 1904, ideology: "Liberalkonservativt", status: "Aktuella vallöften",
    overview: "Moderaterna prioriterar stärkt familjeekonomi, lägre skatt på arbete, hårdare brottsbekämpning, stram migration, valfrihet i välfärden och ett starkare försvar.",
    priorities: ["Sänk skatten för arbetande föräldrar och avskaffa avgiften för förskola och fritidshem.", "Stärk polis, domstolar och kriminalvård.", "Behåll en stram migrationspolitik med tydliga krav.", "Bygg ny kärnkraft och förstärk försvaret."],
    positions: {
      ekonomi: "Sänk skatten på arbete, pension och företagande, särskilt för arbetande föräldrar. Höj gränsen för skattefritt sparande och stärk arbetslinjen.",
      vard: "Försvara valfrihet och privata utförare med skärpt kvalitetskontroll. Korta vårdköer och prioritera kärnverksamhet framför administration.",
      skola: "Återupprätta kunskap, ordning och lärarnas auktoritet. Stärk statens kvalitetskontroll, behåll skolvalet och avskaffa avgiften för förskola och fritidshem.",
      brott: "Bygg ut polis, domstolar och kriminalvård. Avskaffa mängdrabatten senast den 1 januari 2029, skärp straff, slå mot gängens ekonomi och ge rättsväsendet fler verktyg.",
      migration: "Behåll en stram migrationspolitik och skärp kraven för medborgarskap, egen försörjning och integration. Utvisning ska användas mer vid brott.",
      klimat: "Minska utsläpp genom teknik, elektrifiering och investeringar som bevarar konkurrenskraft. Klimatpolitiken ska vara kostnadseffektiv.",
      energi: "Bygg ny kärnkraft, förstärk elnäten och säkra planerbar fossilfri el. Korta tillståndsprocesserna för energiinvesteringar.",
      demokrati: "Stärk försvar, Nato samarbete, EU:s säkerhet och stödet till Ukraina. Skydda rättsstat och demokratiska institutioner.",
      regering: "Partiet vill att Ulf Kristersson fortsätter som statsminister med den nuvarande regeringssidan som grund.",
    },
    sources: [
      { title: "Vallöften 2026", url: "https://moderaterna.se/valloften-2026/" },
      { title: "Politiskt handlingsprogram", url: "https://moderaterna.se/app/uploads/2025/10/Stammohandlingar2025_6oktober.pdf" },
      { title: "Besked om avskaffad mängdrabatt", url: "https://moderaterna.se/nyhet/mangdrabatten-ska-avskaffas-2029/", publishedAt: "26 augusti 2026" },
    ],
  },
  {
    id: "socialdemokraterna", name: "Socialdemokraterna", short: "S", color: "#d82c38", emblem: "/emblems/socialdemokraterna.png", group: "riksdag", founded: 1889, ideology: "Socialdemokratiskt", status: "Aktuella vallöften",
    overview: "Socialdemokraterna vill prioritera hushållens ekonomi, starkare välfärd, fler jobb genom industriinvesteringar, statlig närvaro i hela landet och en offensiv mot organiserad brottslighet.",
    priorities: ["Stärk hushållens ekonomi och minska ekonomiska klyftor.", "Stoppa vinstjakt i skola och förskola.", "Bekämpa gäng och kriminell ekonomi med polis och förebyggande politik.", "Stöd gröna industriinvesteringar, bostadsbyggande och ett Landsbygdslyft för fler jobb i hela landet."],
    positions: {
      ekonomi: "Stärk hushåll med riktade lättnader och en mer progressiv skatt. Slut en tillväxtpakt med näringslivet, förstärk systemet för korttidsarbete och använd gröna kreditgarantier, investeringsstöd och statliga byggkrediter för fler jobb, industriinvesteringar och bostäder i hela landet.",
      vard: "Ge välfärden mer resurser och offentlig kontroll. Korta vårdköer, stärk personalen och minska utrymmet för vinststyrning.",
      skola: "Stoppa vinstjakt i skola och förskola, öka likvärdigheten och stärk lärare, elevhälsa och tidigt stöd.",
      brott: "Slå mot maffialiknande strukturer och kriminell ekonomi med fler poliser och hårdare verktyg. Kombinera detta med socialtjänst, skola och områdespolitik.",
      migration: "Behåll en stram migrationslinje och ställ krav på svenska, arbete och integration. Samhället ska bryta segregation och trångboddhet.",
      klimat: "Driv klimatomställningen med gröna krediter, industristöd, elektrifierade transporter och offentlig upphandling. Stärk stödet till tunga elfordon och laddinfrastruktur. Stoppa storskaligt industrifiske av sill och strömming i Östersjön, flytta ut trålgränsen permanent och värna kustfisket. Gör kollektivtrafiken avgiftsfri för barn och unga på fritiden samt för heltidsstudenter under terminerna.",
      energi: "Bygg ut fossilfri el genom en teknikneutral mix av kärnkraft, vind, vatten och elnät. Staten ska ta större ansvar för energiplaneringen.",
      demokrati: "Stärk demokrati, civilsamhälle och totalförsvar. Fördjupa EU samarbetet där det stärker jobb och säkerhet och fortsätt stödet till Ukraina.",
      regering: "Partiet vill leda en ny regering under Magdalena Andersson med gemensamma reformer och ett stabilt regeringsunderlag.",
    },
    sources: [
      { title: "Val 2026", url: "https://www.socialdemokraterna.se/val-2026" },
      { title: "Principer för en ny regering", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-03-magdalena-andersson-inleder-valturnen---presenterar-tre-principer-for-en-regering-ledd-av-henne" },
      { title: "Vallöfte om jobb och klimat", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-25-s-vallofte-fler-jobb-och-lagre-klimatutslapp", publishedAt: "25 augusti 2026" },
      { title: "Vallöfte om ett sammanhållet Sverige", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-25-s-sverige-ska-halla-ihop", publishedAt: "25 augusti 2026" },
      { title: "Vallöfte om stärkt industrikonkurrens", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-27-s-vallofte-starkt-konkurrens-i-svensk-industri", publishedAt: "27 augusti 2026" },
      { title: "Vallöfte om Östersjöfisket", url: "https://www.socialdemokraterna.se/nyheter/nyheter/2026-08-27-s-vallofte-stoppa-det-storskaliga-industrifisket-av-sill-och-stromming-i-ostersjon", publishedAt: "27 augusti 2026" },
    ],
  },
  {
    id: "sverigedemokraterna", name: "Sverigedemokraterna", short: "SD", color: "#d8a814", emblem: "/emblems/sverigedemokraterna.png", group: "riksdag", founded: 1988, ideology: "Socialkonservativt och nationalistiskt", status: "Aktuellt valmanifest",
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
    id: "vansterpartiet", name: "Vänsterpartiet", short: "V", color: "#b31942", emblem: "/emblems/vansterpartiet.svg", group: "riksdag", founded: 1917, ideology: "Socialistiskt och feministiskt", status: "Aktuellt valmanifest",
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
    id: "medborgerligsamling", name: "Medborgerlig Samling", short: "MED", color: "#23466c", emblem: "/emblems/medborgerligsamling.webp", group: "fler", founded: 2014, ideology: "Liberalkonservativt", status: "Programmaterial granskas",
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
    id: "nyans", name: "Partiet Nyans", short: "PN", color: "#ef7b2c", emblem: "/emblems/nyans.jpg", group: "fler", founded: 2019, ideology: "Minoritetspolitiskt och socialt", status: "Programmaterial granskas",
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
    id: "orebropartiet", name: "Örebropartiet", short: "ÖP", color: "#d94732", emblem: "/emblems/orebropartiet.png", group: "fler", founded: 2014, ideology: "Lokalt förankrat och systemkritiskt", status: "Valprogram publiceras löpande",
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
  {
    id: "alternativforsverige", name: "Alternativ för Sverige", short: "AfS", color: "#1d4f91", emblem: "/emblems/alternativforsverige.png", group: "fler", founded: 2018, ideology: "Nationalistiskt och EU kritiskt", status: "Programmaterial granskas",
    overview: "Alternativ för Sverige prioriterar stoppad asylinvandring, omfattande återvandring, utträde ur EU, lägre skatter och en sträng kriminalpolitik.",
    priorities: ["Stoppa all asylrelaterad invandring.", "Inrätta ett återvandringsverk och genomför ett omfattande återvandringsprogram.", "Lämna EU efter en ny folkomröstning.", "Sänk skatter och prioritera vård, trygghet och nationellt självbestämmande."],
    positions: {
      ekonomi: "Sänk skatter, minska offentlig byråkrati och statlig skuldsättning och försvara kontanter. Partiet vill omprioritera utgifter från migration, EU och bistånd till välfärd och kärnverksamhet.",
      vard: "Prioritera primärvården, inför fri tandvård och avskaffa regionerna. Svensk välfärd ska i högre grad kopplas till medborgarskap.",
      skola: "Sätt kunskap, ordning och lärarnas auktoritet i centrum. Skolan ska förmedla svensk kultur och familjer ska få större inflytande över barnens utbildning.",
      brott: "Skärp straffen kraftigt, avskaffa automatisk villkorlig frigivning och stärk nödvärnsrätten. Partiet vill samtidigt begränsa generell övervakning av personer som inte är misstänkta för brott.",
      migration: "Stoppa asyl och kvotflyktingmottagandet, inrätta ett återvandringsverk och använd både frivillig och tvingande återvandring. Kraven för medborgarskap ska skärpas kraftigt.",
      klimat: "Värna biologisk mångfald, jordbruk, skog och nationell självförsörjning. Miljöpolitiken ska enligt partiet bygga på lokalt naturansvar och inte försvaga produktion eller landsbygd.",
      energi: "Prioritera en stabil och nationellt kontrollerad energiförsörjning och motsätt dig politik som höjer hushållens drivmedels och elkostnader. Programmet ger inte en fullständig aktuell fördelning mellan kraftslagen.",
      demokrati: "Inför fler bindande folkomröstningar, minska antalet myndigheter och stärk politiskt ansvarsutkrävande. Sverige ska lämna EU och stå militärt alliansfritt utanför Nato.",
      regering: "Partiet fokuserar på riksdagsinträde och har inte publicerat en bindande nationell koalitionslinje för 2026.",
    },
    sources: [
      { title: "Samlade politiska program", url: "https://alternativforsverige.se/politik/" },
      { title: "Ekonomisk politik", url: "https://alternativforsverige.se/politik/ekonomisk-politik/" },
      { title: "Återvandringspolitik", url: "https://alternativforsverige.se/politik/atervandring/" },
    ],
  },
  {
    id: "piratpartiet", name: "Piratpartiet", short: "PP", color: "#56329a", emblem: "/emblems/piratpartiet.png", group: "fler", founded: 2006, ideology: "Frihetligt och digitalpolitiskt", status: "Programmaterial granskas",
    overview: "Piratpartiet sätter personlig integritet, ett fritt internet, öppen kunskap, deltagande demokrati och evidensbaserade beslut i centrum.",
    priorities: ["Stoppa massövervakning och skydda kryptering och privatliv.", "Stärk grundlagar, offentlighetsprincip och direkt medborgarinflytande.", "Inför ett generellt ekonomiskt grundstöd och bättre villkor för små företag.", "Modernisera skola, vård och offentlig digitalisering utifrån forskning och öppen teknik."],
    positions: {
      ekonomi: "Utred skattesystemet i grunden, förbättra villkoren för små och innovativa företag och ersätt delar av trygghetssystemen med ett generellt ekonomiskt stöd. Data och kunskap ses som centrala ekonomiska resurser.",
      vard: "Gör vården jämlik, evidensbaserad och integritetssäker. Jämställ psykisk och fysisk hälsa, stärk beroendevård och låt patienten styra vem som får se journaluppgifter.",
      skola: "Stärk lärarnas profession, forskningsanknytningen och elevernas rätt till stöd, hälsa och medbestämmande. Resurser ska följa ansvar och behov.",
      brott: "Prioritera brott med offer och avkriminalisera eget drogbruk. Inför fristående granskning av polis och åklagare, återinför tjänstemannaansvar och begränsa övervakning till konkret misstanke.",
      migration: "Prioritera skyddsbehövande efter utsatthet och förutsättningar och skilj bedömningen av asylskäl från beslut om uppehållstillstånd. Personer som begår allvarliga brott ska kunna utvisas.",
      klimat: "Låt miljöbeslut vara evidensbaserade, främja grön innovation och skydda biologisk mångfald. Fossilfri energi ska kombineras med lokal egenproduktion.",
      energi: "Använd en blandning av fossilfria kraftslag, inklusive dagens kärnkraft, och stärk möjligheten till egen el från sol, värme och mindre vindkraft.",
      demokrati: "Stärk grundlagar, offentlighetsprincip, direktdemokrati och ett fritt internet. Reformera EU mot större insyn, ett starkare parlament och tydligare demokratisk kontroll.",
      regering: "Partiet ställer upp med nationell lista 2026 men har inte publicerat en bindande regerings eller koalitionslinje.",
    },
    sources: [
      { title: "Sakpolitik från A till Ö", url: "https://piratpartiet.se/sakpolitik/" },
      { title: "Principprogram", url: "https://piratpartiet.se/principprogram/" },
      { title: "Piratpartiet i valen 2026", url: "https://piratpartiet.se/nyheter/piratpartiet-i-valen-2026/" },
    ],
  },
  {
    id: "partietmod", name: "Partiet MoD", short: "MoD", color: "#e3a814", emblem: "/emblems/partietmod.png", group: "fler", founded: 2021, ideology: "Direktdemokratiskt och suveränistiskt", status: "Aktuellt valmanifest",
    overview: "Partiet MoD kombinerar direktdemokrati, nationellt självbestämmande, ekonomisk omfördelning, digital integritet och en utrikespolitik byggd på alliansfrihet.",
    priorities: ["Lämna EU genom folkomröstning och lämna Nato.", "Inför fler folkomröstningar och avskaffa riksdagsspärren.", "Inför stegvis basinkomst och progressiv beskattning av kapital och stora förmögenheter.", "Förbjud generell massövervakning och stärk insynen i offentlig AI."],
    positions: {
      ekonomi: "Stärk Riksbankens roll, beskatta stora förmögenheter, kapital och bankövervinster mer och inför en stegvis basinkomst. Skydda kontanter och hushållens sparande från spekulation.",
      vard: "Sänk kostnaderna för tandvård och vård, stärk psykisk hälsa och pensioner och minska ekonomiska klyftor. Välfärden ska väga tyngre än kortsiktig vinstmaximering.",
      skola: "Ersätt skolplikt med lärorätt, tillåt reglerad hemundervisning och skydda alternativa pedagogiker. Stärk elevinflytande, studiero, folkbildning och mobilfria skoldagar.",
      brott: "Valmanifestet har ingen fristående kriminalpolitisk del. Det betonar tjänstemannaansvar, starkare konstitutionell kontroll, mänskliga rättigheter och motstånd mot generell massövervakning.",
      migration: "Partiet vill återta nationell kontroll över gränspolitiken genom ett svenskt EU utträde. Någon fullständig migrationsmodell presenteras inte i valmanifestet för 2026.",
      klimat: "Stärk lokal och regional matproduktion, ekologiskt och regenerativt jordbruk och svensk självförsörjning. Fasa ut glyfosat och andra riskabla bekämpningsmedel.",
      energi: "Valmanifestet för 2026 presenterar inte någon fullständig modell för elsystemets kraftslag. Energifrågan behandlas främst genom självförsörjning, ekonomisk trygghet och nationellt självbestämmande.",
      demokrati: "Inför fler folkomröstningar, medborgarinitiativ och tjänstemannaansvar och avskaffa riksdagsspärren. Sverige ska lämna EU och Nato, skydda yttrandefrihet och stoppa generell massövervakning.",
      regering: "Partiet fokuserar på riksdagsinträde och har inte publicerat en bindande nationell koalitionslinje för 2026.",
    },
    sources: [
      { title: "Valmanifest 2026", url: "https://partietmod.se/politik/valmanifest-2026/" },
      { title: "Partiprogram", url: "https://partietmod.se/politik/partiprogram/" },
      { title: "Riksdagslista 2026", url: "https://partietmod.se/aktuellt/nyheter/mod-staller-upp-i-riksdagsvalet-2026-har-ar-var-lista/" },
    ],
  },
];

export const partiesByFounded = [...parties].sort(
  (a, b) => a.founded - b.founded || a.name.localeCompare(b.name, "sv"),
);
