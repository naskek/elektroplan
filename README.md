# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1.7

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
