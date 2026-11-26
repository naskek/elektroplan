# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1.18

Otevřete [ElektroPlan](https://naskek.github.io/elektroplan/) nebo soubor `index.html` v prohlížeči. Nahrajte obrázek půdorysu, případně jej otočte. Zadejte známý rozměr v milimetrech a klikněte na jeho dva konce. Poté umístěte prvky a nakreslete jednotlivé kabelové trasy. Každá trasa představuje jeden kabel; svislé úseky se zadávají ručně. Výkaz zahrnuje zadanou montážní rezervu. Projekt uložte tlačítkem **Uložit projekt (JSON)**. Tlačítkem **Otevřít projekt** načtete uložený soubor včetně podkladu nebo kresby, měřítka, prvků, kabelových tras, svislých úseků a montážní rezervy. Aplikace ověřuje strukturu a rozměry souboru před nahrazením aktuálního projektu. Rozpracované trasy a nedokončená kalibrace se neukládají. Před zavřením stránky uložte změny ručně.

Aplikace neodesílá podklad na server. Export obsahuje obrázek půdorysu, proto jej nesdílejte bez oprávnění.

## Ruční kreslení půdorysu

1. Aplikace začíná prázdnou pracovní plochou. V části **Rozměry pracovní plochy** lze nastavit její velikost v milimetrech; nejde o rozměry bytu. Pro nový projekt použijte **Nový půdorys**. Měřítko kresby je automatické.
2. Nástrojem **Stěna** klikněte na začátek a pohybujte myší; náhled ukazuje délku v milimetrech. Druhým kliknutím nebo tažením myší stěnu dokončíte. Pro přesnou délku zadejte například 2131 mm, určete směr kurzorem nebo volbou směru a stiskněte Enter. Přesný rozměr není zaokrouhlován na mřížku. Parametry vybraného nástroje jsou v horním panelu.
3. Nástroj **Obdélník** vytvoří obvod ze dvou protilehlých rohů; šířku i výšku lze zadat v celých milimetrech. Zadané rozměry odpovídají skutečným vnitřním rozměrům místnosti. Tloušťka čáry je pouze grafická a nemění plochu, obvod ani délky. Společné stěny kreslete pouze jednou. Dveře a okna vkládejte do existujících stěn. Společnou stěnu nevytvářejte dvakrát.
4. Nástrojem **Název místnosti** vyberte běžný název nebo napište vlastní a přidejte popisky a poté rozmístěte elektroinstalační prvky a kabely.
5. Uložte projekt do JSON. Formát verze 4 ukládá otvory, vázané ruční kóty a nastavení zobrazení. Aplikace načítá také starší soubory verzí 1–3.

## Otvory, kóty a plochy

- **Dveře / Okno:** vyberte šířku dveří nebo okna v dialogu. Přesuňte kurzor na stěnu; náhled ukazuje umístění a orientaci před kliknutím. Dveře se standardně otevírají na stranu kurzoru; závěs i směr lze přehodit tlačítky. Otvor je vázán na konkrétní stěnu; při jejím odstranění se odstraní také otvor. Otvory nesmějí přesahovat stěnu ani se překrývat na stejném úseku.
- **Automatické kóty:** zobrazují čisté vnitřní rozměry uzavřených místností a šířky otvorů v milimetrech. **Ruční kóta** měří vzdálenost mezi dvěma vybranými body. Kóty zatím nelze přesouvat ani měnit jejich text přímo.
- **Plochy místností:** aplikace automaticky vyhledá uzavřené prostory mezi pravoúhlými stěnami a vypočítá jejich čistou geometrickou plochu a obvod podle zakreslených hranic místností bez odečtení grafické tloušťky čar. Dveřní a okenní otvory se pro rozdělení místností považují za uzavřené. Název místnosti je přiřazen podle polohy popisku.
- Šikmé stěny zatím nejsou podporovány automatickým výpočtem ploch. U složitých nebo nezavřených půdorysů se plocha nemusí zobrazit. Výsledek není úřední výměrou podlahové plochy. Otvory umísťujte mimo křížení stěn a neduplikujte společné stěny.

## Další vývoj

- Editace polohy prvků a tras, přiblížení a posun půdorysu.
- Úprava délek již nakreslených stěn, posun kót a otvorů, kontrola křížení stěn.
- Ověřená knihovna značek a topologií ovládání osvětlení.
- Samostatná evidence stavebních tras a kabelů, výkaz drážek a trubek.
- Návrh okruhů, zatížení fází a kontrolní výpočty s doloženými pravidly.
- Výkaz rozvaděče, katalog materiálu a cen (K&V ELEKTRO po potvrzení dostupnosti dat).
- Rozpočet prací, export a případné cloudové úložiště.

## Omezení

Pracovní prototyp není projektovou dokumentací ani nástrojem pro ověřený návrh jištění. Značky a výpočtová pravidla musejí být ověřeny podle platných požadavků ČSN a podmínek konkrétní instalace. Ceny a automatický výběr kabelů zatím nejsou součástí aplikace.


## Výběr a úpravy otvorů (0.1.5)

- Kliknutím na **Dveře** nebo **Okno** otevřete výběr běžných šířek či zadáte vlastní šířku v celých milimetrech. Najeďte kurzorem na stěnu: náhled ukazuje vzdálenost od začátku stěny, šířku otvoru a vzdálenost ke konci stěny. Kliknutím otvor vložíte.
- Po vložení se zobrazí **Vlastnosti prvku** vpravo. Šířku a vzdálenost od obou konců lze upravit a potvrdit tlačítkem **Použít**. U dveří lze také přehodit závěs nebo směr otevření.
- Dříve vložený otvor vyberete nástrojem **Výběr a úpravy**, kliknutím na položku ve výkazu nebo pravým tlačítkem přímo v otvoru. Pravé tlačítko zobrazí místní nabídku s editorem vlastností.
- V části **Zobrazení a nastavení** lze změnit krok kreslení (1, 10, 100, 250, 500 nebo 1000 mm, případně bez přichycení) a přichycení k bodům. Při kreslení stěn se přednostně použijí blízké konce existujících stěn nebo jejich čáry. Přesně zadaný rozměr má přednost.
- Nástroj **Kóta** se přichytí ke koncům stěn a okrajům otvorů; modrý bod ukazuje nalezené přichycení. Navázaná kóta se při změně otvoru přepočítá. U samostatného uzavřeného obdélníku jsou automaticky zobrazeny jen dvě hlavní kóty.
- Projektový formát 4 ukládá body kót a nastavení kroku. Starší formáty 1–3 zůstávají podporovány.

Omezení: vzdálenosti otvorů se měří od konců zakresleného úseku; grafická tloušťka se nezapočítává. Přichycení zatím nenahrazuje úplný uzlový model stěn ani automatické řešení složitých křižovatek. Vlastnosti již nakreslených stěn se zatím neupravují.

## Schematický půdorys (0.1.7)

ElektroPlan pracuje se schématem elektroinstalace, nikoli se stavebním modelem. Každá nakreslená čára stěny představuje hranici vnitřního prostoru. Grafická tloušťka čáry nemá vliv na délku, plochu, obvod, kóty ani umístění otvorů. Obdélník 2000 × 3000 mm má plochu 6 m² a obvod 10 m bez ohledu na tloušťku čar. Dveřní otvor 600 mm ve stěně dlouhé 2000 mm ponechá celkem 1400 mm na obou stranách.

Uzavřené pravoúhlé místnosti se zjišťují podle propojených čar, nikoli podle překrytí jejich grafických tahů. Příčka může rozdělit místnost na dvě samostatné plochy. Neuzavřený obvod nemá vypočtenou plochu. Šikmé stěny lze kreslit a kótovat, ale jejich automatická plocha zatím není podporována.

Starší soubory zůstávají čitelné a jejich souřadnice se nemění. Plochy se však po načtení přepočítají podle nové schematické geometrie. Výsledky nevyjadřují stavební výměru ani tloušťku konstrukcí.

## Historie změn a guma (0.1.8)

- **Zpět** (Ctrl+Z) vrací poslední dokončenou změnu, **Znovu** (Ctrl+Y nebo Ctrl+Shift+Z) ji obnoví. U rozpracované trasy nebo stěny lze vracet a obnovovat jednotlivé body. Historie zahrnuje přidávání, odstraňování, změny otvorů a kalibraci měřítka; uchovává nejvýše 100 dokončených změn v aktuální relaci. Nová dokončená změna po kroku zpět zruší větev opakování.
- **Guma** (E): najeďte na prvek, červený náhled označí cíl, kliknutím jej odstraníte. Lze odstranit stěnu, jednotlivou stranu obdélníku, dveře, okno, popisek, ruční kótu, elektroinstalační prvek nebo kabelovou trasu. Při odstranění stěny se odstraní i její otvory a závislé ruční kóty. Ostatní strany obdélníku včetně jejich otvorů zůstávají zachovány. Celou operaci lze vrátit jedním krokem zpět.
- Vybraný otvor lze odstranit také klávesou Delete. Při zadávání textu či čísla zůstávají zachovány obvyklé zkratky pro editaci textu. Historie není ukládána do projektového JSON; vytvoření nového projektu, otevření jiného projektu nebo výměna či otočení podkladu ji vymaže. Automatické kóty se přepočítávají, nemažou se jednotlivě gumou.

## Pomocná vodítka (0.1.9)

Nástroj **Vodítko** (G) slouží k přesnému vytyčení bodů pro další kreslení; **Kóta** zůstává měřicím nástrojem.

1. Nakreslete například obvod 12 500 × 6 110 mm.
2. Zvolte **Vodítko** a klikněte na horní roh. Zadejte vzdálenost 2550 mm a směr **Dolů**. Potvrďte klávesou Enter nebo tlačítkem **Vložit vodítko**.
3. Zobrazí se vodorovná přerušovaná čára v přesné vzdálenosti 2550 mm od výchozího bodu. Nástrojem **Stěna** najeďte na průsečík vodítka se stávající stěnou. Bod přichycení se zvýrazní a má přednost před běžným krokem mřížky. Nakreslete novou stěnu nebo zadejte její délku.
4. Další vodítka můžete vytvořit vodorovně i svisle v libovolné celočíselné vzdálenosti v milimetrech. Přichycení funguje také v průsečících vodítek.

V části **Zobrazení a nastavení** lze vodítka skrýt (současně vypnout přichycení k nim) nebo hromadně odstranit. Jednotlivá vodítka lze odstranit gumou či ve výkazu. Vložení a odstranění je součástí historie změn. Vodítka nejsou stěny, nevytvářejí místnosti a nezapočítávají se do ploch, obvodů, elektroinstalačních prvků ani kabelů. Formát projektu 5 ukládá vodítka a jejich viditelnost; starší projekty lze nadále otevřít. Vodítka jsou zatím dostupná pouze v ručně kresleném půdorysu. Jejich poloha je pevná, nikoli parametricky závislá na pozdějších úpravách stěn.

## Přesun kót a kontrola uzavření místností (0.1.10)

Nástroj **Přesun kót** umožňuje tažením myší přesunout automatickou nebo ruční kótu kolmo k její měřené vzdálenosti. Hodnota kóty ani souřadnice stěn se nemění. Přesun lze vrátit pomocí Ctrl+Z. V nastavení lze samostatně skrýt kóty otvorů nebo obnovit výchozí polohy všech kót. Projektový formát 6 ukládá vlastní posuny a nastavení zobrazení. Předchozí formáty 1–5 zůstávají podporovány.

Ve výkazu ploch se zobrazí upozornění, pokud dva nebo více názvů patří do stejného uzavřeného prostoru, nebo pokud popisek není v uzavřené místnosti. Kontrola hledá mezery do 100 mm, které lze uzavřít prodloužením konce stěny na jinou stěnu. Podezřelá místa jsou oranžově označena. U jednotlivé stěny lze použít **Uzavřít mezeru**; změna délky vyžaduje potvrzení a lze ji vrátit. Oprava nepřesouvá existující otvory. Kontrola není úplným ověřením geometrie a nezjišťuje všechny typy chyb. Polohy automatických kót jsou navázány na konkrétní měřené úseky; při změně jejich geometrie se mohou vrátit na výchozí pozici.

Před aktualizací stránky uložte rozpracovaný projekt tlačítkem **Uložit projekt (JSON)**. Automatické ukládání zatím není k dispozici.

## Vrstvy, druhy tras a značky (0.1.11)

V panelu **Vrstvy a zobrazení** lze samostatně zobrazit kóty stěn, dveří, oken a ruční kóty. Hlavní přepínač **Zobrazit kóty** skryje všechny kóty bez odstranění jejich dat. Předvolby **Půdorys**, **Elektro** a **Vše** usnadňují přepínání pracovního pohledu. Elektroinstalační prvky a jednotlivé druhy tras mají samostatné filtry; půdorys zůstává viditelný. Filtry neovlivňují výkaz materiálu ani délky kabelů.

Před kreslením kabelu vyberte **Druh trasy**: světelná (plná čára), zásuvková (čárkovaná), datová (tečkovaná) nebo ostatní (čerchovaná). Jde o konvenci tohoto výkresu, nikoli obecně závazné rozlišení podle ČSN. Typ kabelu zůstává nezávislý na druhu trasy; nabízené výchozí kabely nejsou ověřeným návrhem dimenzování. Druh již zakreslené trasy lze změnit ve výkazu. Staré trasy bez druhu jsou označeny jako ostatní / neurčené. Při ručním kreslení lze trasu přichytit k viditelným elektroinstalačním prvkům.

Rozšířená pracovní knihovna zahrnuje zásuvku 230 V, dvojzásuvku, trojnásobnou zásuvku, zásuvku 400 V, datové zásuvky RJ45 (1× a 2×), TV zásuvku, rozvodnou krabici, svítidlo, spínače řazení 1, 5, 6, 7 a rozvaděč. Značky jsou inspirovány veřejným [výběrem grafických značek IEC 60617DB](https://www.agenturacas.gov.cz/wp-content/uploads/Graficke-znacky-na-schematech.pdf), zejména str. 100–101, S00457–S00472. Některá doplňková označení a kresba jsou vlastní pracovní konvencí. Nejde o certifikovanou normovou knihovnu. Legenda je dostupná ve výkazu. Vícenásobná zásuvka zatím představuje jeden zakreslený prvek, nikoli automatický výkaz samostatných zásuvkových mechanismů.

Formát projektu 7 ukládá druhy tras a viditelnost vrstev. Starší soubory lze otevřít. Před aktualizací stránky uložte projekt do JSON.

## Výběr, jednotlivé kóty a poloha prvků (0.1.12)

Nástroj **Výběr a úpravy** (V) nahrazuje samostatný nástroj Přesun kót. Kliknutím vyberte prvek nebo kótu, pravým tlačítkem otevřete nabídku vlastností. Kótu lze táhnout kolmo k měřené vzdálenosti, nastavit její odsazení v mm, obnovit polohu nebo ji skrýt. Ruční kótu lze také odstranit; Delete u automatické kóty ji pouze skryje. V nastavení **Zobrazit skryté kóty** obnoví všechny jednotlivě skryté kóty, nikoli vypnuté vrstvy. Změny podporují historii a ukládají se do formátu projektu 8. Předchozí formáty zůstávají čitelné.

Elektroinstalační prvky lze stále umístit prostým kliknutím. Ve vlastnostech lze volitelně zpřesnit souřadnice X a Y v celých milimetrech a natočení značky. V rozpoznané obdélníkové místnosti se souřadnice měří od levého horního rohu místnosti a lze použít **Doprostřed místnosti**. Jinak se měří od počátku pracovní plochy. U obrázkového podkladu je nutné nastavit měřítko. Přesun prvku zatím nemění již zakreslené kabelové trasy; při přesunu bodu shodného s bodem trasy aplikace upozorní na tuto skutečnost. Výšky prvků a automatický výpočet svislých úseků nejsou součástí této verze. Stěny se automaticky neslučují; nežádoucí jednotlivou kótu lze skrýt.

## Automatické okruhy a příkony (0.1.13)

Nástroj **Kabelová trasa** ve výchozím režimu **Automatický okruh od rozvaděče** začíná kliknutím na rozvaděč. Klikněte na další prvky a podle potřeby přidejte mezilehlé lomové body. První zásuvka nebo světelný prvek určí druh okruhu a styl čáry. Okruh dokončete tlačítkem nebo Enter na připojeném prvku. Pravý panel zobrazuje počet zásuvkových vývodů a zdířek, příkon svítidel, neznámé příkony a délku trasy s rezervou. Jeden prvek nelze v tomto režimu připojit dvakrát ani do dvou různých okruhů (s výjimkou rozvaděče). Zásuvkové a světelné prvky se nemíchají; datové a ostatní trasy se zatím kreslí ručně. Ruční režimy zachovávají dosavadní funkci bez kontroly okruhu.

Pro běžné zásuvkové okruhy je kontrolováno nejvýše 10 vývodů podle veřejných odborných výkladů ČSN 33 2130 ed. 4. Dvojzásuvka s jedním společným strojkem se počítá jako jeden vývod, dva samostatné strojky jako dva, tři samostatné jako tři. Výchozí provedení dvojzásuvky je dvojice samostatných strojků; volbu lze změnit před vložením i ve vlastnostech. Počet zdířek je vykázán samostatně. Zdroje: [ElektroPrůmysl](https://www.elektroprumysl.cz/elektroinstalace/csn-33-2130-ed-4-elektricke-instalace-nizkeho-napeti-vnitrni-elektricke-rozvody-1-cast), [OEZ](https://www.oez.cz/aktuality/hlavni-novinky-v-ochrane-a-jisteni-zasuvkovych-a-svetelnych-obvodu-podle-csn-33-2130-ed4). Kontrola počtu není potvrzením správného jištění, proudové zatížitelnosti ani souladu s normou.

Při vložení svítidla lze zadat příkon ve W; prázdná hodnota zůstane neznámá, nikoli nulová. Příkon lze upravit ve vlastnostech prvku. Výkaz sčítá známé příkony a uvádí počet neznámých. Orientační proud je vypočten pouze při známých příkonech za předpokladu 230 V a účiníku 1. Přidáno řazení 6+6 (dvojitý střídavý přepínač). Značka je pracovní. Okruh je zatím pouze souvislá trasa s odkazy na prvky, nikoli ověřené schéma zapojení spínačů. Světelné okruhy se spínači vyžadují kontrolu zapojení a počtu žil; jeden typ kabelu platí pro celou trasu, výchozí světelný kabel je neurčený. Větvení, skupiny ovládání, samostatné typy kabelů pro úseky, jističe a automatické svislé délky zatím nejsou řešeny.

Přesun připojeného prvku aktualizuje odpovídající body automatického okruhu, ale nepřepočítává celou trasu podle stěn. Před odstraněním připojeného prvku odstraňte jeho okruh. Formát projektu 9 ukládá vazby, provedení dvojzásuvek a příkony; starší projekty zůstávají čitelné, staré ruční trasy se automaticky nepřevádějí.

## Přesun elektroinstalačních prvků (0.1.14)

Nástrojem **Výběr a úpravy** (V) klikněte na značku nebo ji přetáhněte levým tlačítkem myši. Vybraný prvek má modré orámování. V ručně kresleném půdorysu se používá aktuální krok kreslení a přichycení; podržením Alt lze při tažení přichycení dočasně vypnout. Esc zruší rozpracované tažení. Pravé tlačítko nadále otevírá vlastnosti. Přesun je jednou změnou v historii a podporuje Ctrl+Z a Ctrl+Y.

Navázané body automatických okruhů se přesunují současně s prvkem, délky se po dokončení přepočítají. Mezilehlé lomové body zůstávají na svém místě; trasa se automaticky nepřesměrovává kolem stěn. Pokud v původní poloze leží bod ručně kreslené trasy bez vazby, aplikace před přesunem upozorní, že tato trasa nebude změněna. Formát projektu se nemění (verze 9).

## Ovládání osvětlení z více míst (0.1.15)

Kliknutím na řazení 6 otevřete průvodce. Zvolte 1–20 ovládacích míst, předběžný typ propojovacího kabelu a případně samostatnou odbočnou krabici. Pro dvě a více míst průvodce vytvoří dva krajní přepínače řazení 6 a mezi nimi potřebný počet přepínačů řazení 7. Klikněte postupně na jejich polohy a případně na polohu odbočné krabice. Celá skupina se uloží jedním krokem historie. Jedno místo znamená samostatně vložený přepínač 6, nikoli úplné schodišťové zapojení.

Fialové plné propojovací úseky jsou pouze předběžný odhad délky mezi sousedními přepínači. Výchozí volba CYKY-O 3×1,5 je pracovní předpoklad, nikoli doporučení pro každou instalaci. Kabel neobsahuje ochrannou žílu; ověřte skutečné zapojení, potřebu a vedení PE a N, počet pracovních žil a podmínky instalace. Ve vlastnostech propojovacího kabelu lze změnit typ a ručně doplnit svislou délku. Mezi přepínači se automaticky kreslí přímé úseky, nikoli ověřená montážní trasa. Přívod, vývod ke svítidlu, propojení odbočné krabice a skupiny svítidel zatím nejsou automaticky řešeny. Běžný automatický okruh blokuje opakované přímé spojení dvojice již propojených přepínačů; ruční trasy je nutné kontrolovat proti dvojímu započtení. Propojení není samostatným jištěným okruhem. Při přesunu přepínače se navázané propojovací úseky aktualizují.

Výkaz **Krabice a ovládání** počítá jednu přístrojovou krabici pro každý zakreslený spínač či přepínač; skutečný typ a počet pro sestavy je třeba ověřit. Samostatné odbočné krabice se vykazují jen při jejich vložení. Spoje mohou být podle zvoleného řešení v vhodné přístrojové krabici, není nutná samostatná odbočná krabice pro každý přepínač. Svorky, velikost krabic, skupiny řazení 6+6 a úplná schémata zapojení zatím nejsou automaticky dimenzovány.

Formát projektu 10 ukládá propojovací kabely s odkazy na přepínače. Starší projekty zůstávají čitelné. Zdroje k principu řazení: [iElektra](https://www.ielektra.cz/rsc4885511-schodistovy-vypinac-ze-3-mist-a-dalsi-zapojeni), [Tympol Plus](https://www.tympolplus.cz/obsah/zapojeni-vypinacu).

## Aktivní režim a stav tlačítek (0.1.16)

Aktivní nástroj a předvolba zobrazení mají výrazné modré pozadí, odlišné od světle modrého stavu při najetí myší. Režim zobrazení se určuje podle aktuálních filtrů, včetně viditelnosti vodítek. Pokud nastavení neodpovídá žádné předvolbě, zobrazí se stav Vlastní. Předvolby Půdorys a Vše zapnou všechny dílčí kóty; Elektro vypne jejich hlavní přepínač a dočasně zneaktivní dílčí volby. Formát projektu se nemění.

## Pravoúhlé propojení přepínačů (0.1.17)

Průvodce ovládáním z více míst vytváří vodorovné a svislé úseky namísto přímých diagonál. Z dvojice základních tras vybere variantu s menším počtem příčných průchodů zakreslenými stěnami. Jde o orientační pravidlo, nikoli automatický návrh instalačních zón nebo bezpečného průchodu konstrukcí. Pravým tlačítkem na propojovací kabel lze změnit směr vedení, přehodit roh nebo zadat mezilehlou souřadnici X či Y v mm od počátku pracovní plochy (prázdná hodnota = základní roh). Délka se počítá ze všech úseků, svislé délky se zadávají ručně. Při přesunu přepínače se pravoúhlý tvar obnoví při zachování vybrané varianty a případné mezilehlé souřadnice. Ruční kabelové trasy se nemění.

Formát projektu 11 ukládá směr a mezilehlou souřadnici. Při načtení projektu verze 10 se staré automatické diagonální spoje přepínačů převedou na pravoúhlé trasy, což může zvýšit výkaz délky kabelů. Automatické vedení podél všech stěn, výšky prvků, napojení odbočných krabic a ověření zapojení zatím nejsou řešeny.

## Pravoúhlé kabelové trasy (0.1.18)

Všechny nově kreslené trasy, automatické okruhy i ruční světelné, zásuvkové, datové a ostatní trasy, jsou vedeny vodorovně a svisle. Každé kliknutí přidá zvolený bod; mezi dvěma body se podle potřeby vloží pravoúhlý roh. Volba **Směr rohu** určuje směr dalšího úseku: automaticky (méně příčných průchodů stěnami), vodorovně → svisle nebo svisle → vodorovně. Náhled zobrazuje stejný tvar jako výsledná trasa. Dalšími kliknutími lze určit vlastní lomové body. Zpět a znovu pracují s uživatelskými body, nikoli s jednotlivými automaticky vloženými rohy.

Formát projektu 12 ukládá uživatelské body, směry rohů a výslednou geometrii. Při přesunu navázaného prvku automatického okruhu se zachovají ostatní uživatelské body a obnoví pravoúhlý tvar. Délka se počítá z výsledných úseků včetně ručně zadané svislé délky a rezervy. Starší běžné trasy se při otevření nemění; ve vlastnostech trasy lze po potvrzení použít **Převést na pravoúhlou trasu**. Převod zachovává původní uživatelské body a vazby automatického okruhu, může ale zvýšit délku. Předešlý převod automatických propojení přepínačů z formátu 10 zůstává zachován. Algoritmus nenavrhuje úplnou trasu kolem překážek ani instalační zóny; skutečné vedení je třeba ověřit.
