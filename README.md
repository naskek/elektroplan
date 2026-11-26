# ElektroPlan

Jednoduchý nástroj pro předběžné výkazy elektroinstalačního materiálu a rozpočty bytových elektroinstalací.

## Prototyp 0.1

Otevřete `index.html` v prohlížeči. Nahrajte obrázek půdorysu, případně jej otočte. Zadejte známý rozměr v milimetrech a klikněte na jeho dva konce. Poté umístěte prvky a nakreslete jednotlivé kabelové trasy. Každá trasa představuje jeden kabel; svislé úseky se zadávají ručně. Výkaz zahrnuje zadanou montážní rezervu. Výsledný projekt lze exportovat do JSON (opětovný import zatím není implementován).

Aplikace neodesílá podklad na server. Export obsahuje obrázek půdorysu, proto jej nesdílejte bez oprávnění.

## Další vývoj

- Ukládání a načítání projektů, editace polohy prvků a tras.
- Ověřená knihovna značek a topologií ovládání osvětlení.
- Samostatná evidence stavebních tras a kabelů, výkaz drážek a trubek.
- Návrh okruhů, zatížení fází a kontrolní výpočty s doloženými pravidly.
- Výkaz rozvaděče, katalog materiálu a cen (K&V ELEKTRO po potvrzení dostupnosti dat).
- Rozpočet prací, export a případné cloudové úložiště.

## Omezení

Pracovní prototyp není projektovou dokumentací ani nástrojem pro ověřený návrh jištění. Značky a výpočtová pravidla musejí být ověřeny podle platných požadavků ČSN a podmínek konkrétní instalace. Ceny a automatický výběr kabelů zatím nejsou součástí aplikace.
