# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1.11

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
