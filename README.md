# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1.2

Otevřete [ElektroPlan](https://naskek.github.io/elektroplan/) nebo soubor `index.html` v prohlížeči. Nahrajte obrázek půdorysu, případně jej otočte. Zadejte známý rozměr v milimetrech a klikněte na jeho dva konce. Poté umístěte prvky a nakreslete jednotlivé kabelové trasy. Každá trasa představuje jeden kabel; svislé úseky se zadávají ručně. Výkaz zahrnuje zadanou montážní rezervu. Projekt uložte tlačítkem **Uložit projekt (JSON)**. Tlačítkem **Otevřít projekt** načtete uložený soubor včetně podkladu nebo kresby, měřítka, prvků, kabelových tras, svislých úseků a montážní rezervy. Aplikace ověřuje strukturu a rozměry souboru před nahrazením aktuálního projektu. Rozpracované trasy a nedokončená kalibrace se neukládají. Před zavřením stránky uložte změny ručně.

Aplikace neodesílá podklad na server. Export obsahuje obrázek půdorysu, proto jej nesdílejte bez oprávnění.

## Ruční kreslení půdorysu

1. V části **Nový půdorys** zadejte šířku a výšku pracovní plochy v metrech a klikněte na **Vytvořit prázdný půdorys**. Měřítko se nastaví automaticky.
2. Nástrojem **Stěna** vyznačte začátek a konec. Volitelně zadejte přesnou délku v milimetrech a druhým kliknutím určete směr. Nastavte tloušťku stěny, přichycení k mřížce a případně vypněte pravoúhlé kreslení.
3. Nástroj **Obdélník stěn** vytvoří obvod ze dvou protilehlých rohů. Rozměry jsou uváděny mezi osami stěn, nikoli mezi jejich vnitřními povrchy. Společné stěny kreslete pouze jednou. Otvory zatím vytvořte přerušením samostatných stěn.
4. Nástrojem **Název místnosti** přidejte popisky a poté rozmístěte elektroinstalační prvky a kabely.
5. Uložte projekt do JSON. Nový formát verze 2 podporuje kreslený i obrázkový půdorys; aplikace načítá i starší soubory verze 1.

## Další vývoj

- Editace polohy prvků a tras, přiblížení a posun půdorysu.
- Samostatné dveřní a okenní otvory, úprava délek již nakreslených stěn.
- Ověřená knihovna značek a topologií ovládání osvětlení.
- Samostatná evidence stavebních tras a kabelů, výkaz drážek a trubek.
- Návrh okruhů, zatížení fází a kontrolní výpočty s doloženými pravidly.
- Výkaz rozvaděče, katalog materiálu a cen (K&V ELEKTRO po potvrzení dostupnosti dat).
- Rozpočet prací, export a případné cloudové úložiště.

## Omezení

Pracovní prototyp není projektovou dokumentací ani nástrojem pro ověřený návrh jištění. Značky a výpočtová pravidla musejí být ověřeny podle platných požadavků ČSN a podmínek konkrétní instalace. Ceny a automatický výběr kabelů zatím nejsou součástí aplikace.
