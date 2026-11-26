# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1.3

Otevřete [ElektroPlan](https://naskek.github.io/elektroplan/) nebo soubor `index.html` v prohlížeči. Nahrajte obrázek půdorysu, případně jej otočte. Zadejte známý rozměr v milimetrech a klikněte na jeho dva konce. Poté umístěte prvky a nakreslete jednotlivé kabelové trasy. Každá trasa představuje jeden kabel; svislé úseky se zadávají ručně. Výkaz zahrnuje zadanou montážní rezervu. Projekt uložte tlačítkem **Uložit projekt (JSON)**. Tlačítkem **Otevřít projekt** načtete uložený soubor včetně podkladu nebo kresby, měřítka, prvků, kabelových tras, svislých úseků a montážní rezervy. Aplikace ověřuje strukturu a rozměry souboru před nahrazením aktuálního projektu. Rozpracované trasy a nedokončená kalibrace se neukládají. Před zavřením stránky uložte změny ručně.

Aplikace neodesílá podklad na server. Export obsahuje obrázek půdorysu, proto jej nesdílejte bez oprávnění.

## Ruční kreslení půdorysu

1. V části **Nový půdorys** zadejte šířku a výšku pracovní plochy v metrech a klikněte na **Vytvořit prázdný půdorys**. Měřítko se nastaví automaticky.
2. Nástrojem **Stěna** vyznačte začátek a konec. Volitelně zadejte přesnou délku v milimetrech a druhým kliknutím určete směr. Nastavte tloušťku stěny, přichycení k mřížce a případně vypněte pravoúhlé kreslení.
3. Nástroj **Obdélník stěn** vytvoří obvod ze dvou protilehlých rohů. Rozměry jsou uváděny mezi osami stěn, nikoli mezi jejich vnitřními povrchy. Společné stěny kreslete pouze jednou. Dveře a okna vkládejte do existujících stěn. Společnou stěnu nevytvářejte dvakrát.
4. Nástrojem **Název místnosti** přidejte popisky a poté rozmístěte elektroinstalační prvky a kabely.
5. Uložte projekt do JSON. Formát verze 3 ukládá i otvory, ruční kóty a nastavení zobrazení. Aplikace načítá také starší soubory verzí 1 a 2.

## Otvory, kóty a plochy

- **Dveře / Okno:** nastavte šířku otvoru a klikněte na střed otvoru ve stěně. U dveří nastavte závěs a směr otevření. Otvor je vázán na konkrétní stěnu; při jejím odstranění se odstraní také otvor. Otvory nesmějí přesahovat stěnu ani se překrývat na stejném úseku.
- **Automatické kóty:** zobrazují délky os stěn a šířky otvorů v milimetrech. **Ruční kóta** měří vzdálenost mezi dvěma vybranými body. Kóty zatím nelze přesouvat ani měnit jejich text přímo.
- **Plochy místností:** aplikace automaticky vyhledá uzavřené prostory mezi pravoúhlými stěnami a vypočítá jejich čistou geometrickou plochu a obvod podle vnitřních hran stěn. Dveřní a okenní otvory se pro rozdělení místností považují za uzavřené. Název místnosti je přiřazen podle polohy popisku.
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
