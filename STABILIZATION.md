# Ověření ElektroPlan 0.3.0

Datum: 26. 11. 2026. Výchozí main: `5abac056c213f00b5bd2d7e4a9677db20d039373` (0.2.1). Původní ověřená verze je zachována v historii. Otevřené požadavky #1, #3 a #4 zůstávají širším backlogem; toto je minimální svislý scénář zakázky, nikoli jejich plné dokončení.

## Implementace a UX

- Tři horní kroky: Půdorys, Elektroinstalace, Zakázka. V prvním kroku jsou i elektrické potřeby; není potřeba předem vytvářet okruhy. Dveře neotevírají povinný dialog šířky. Přesné rozměry jsou volitelné, kóty a mezery ve stěnách jsou v novém plánu standardně skryté. Příkony spotřebičů na plánu jsou skryté, dokud nejsou zapnuta označení.
- Počet při kliknutí vloží více samostatných prvků jedním undo krokem; překrytí je označeno ×N. Spotřebiče při vložení ani v hlavním výpočtu nedostávají automatickou fyzickou vazbu k zásuvce.
- Dvě akce od vstupu do výpočtu k uložení návrhu: Orientačně spočítat a Použít návrh. Náhled obsahuje okruhy, fáze, délky a rozvaděč bez potvrzení po jednotlivých okruzích. Ruční okruhy, trasy a fixace se zachovají. Návrh se zastaralým vstupem nelze použít. Pokročilá správa původního prototypu zůstává dostupná.
- Materiál i práce mají jednotkové ceny uživatele, neznámá množství a neúplné délky. Neznámá cena se odlišuje od výslovné nuly. CSV používá stejný model jako UI. Export obsahuje předpoklady a upozornění na neúplný rozsah.
- JSON v15, IndexedDB, ochrana revizí a import v1–v14 zachovány. Rozpočtové nastavení a ceny jsou volitelné pole `estimateSettings`; návrhy, ceny a ruční opravy lze vrátit. Při exportu ve starší aplikaci se nové volitelné rozpočtové údaje ztratí.

## Provedené místní kontroly

- **58 výpočtových kontrol:** původních 45 a 13 nových pro potřebu místnosti bez falešného připojení, oddělení samostatných okruhů, společné trasy 3×10 m, svislé části a rezervu, zachování ručních tras, neznámé měřítko, neověřené světelné zapojení, mechanismy a krabice, prostor v oddělených skříních, neznámé versus nulové ceny a neúplné součty.
- **23 scénářů ve skutečném Chrome:** původních 18 upravených pro novou navigaci a 5 nových. Prázdný plán → místnost / dveře / spotřebiče / zásuvky / spínač / světlo / rozvaděč → společný náhled → uložení → vlastní cena → CSV → F5 → v15 reimport. Bez vynucených nativních potvrzení při rozmisťování a výpočtu. Výběr spotřebiče používá jeden HTML dialog; fyzická vazba není povinná.
- Nové browser regrese: atomické undo návrhu a počtu prvků, ceny s undo/redo a po F5, opakovaný návrh bez duplikace, ruční kabel a fixace fází, odmítnutí zastaralého návrhu, neplatné nastavení odhadu a nezakryté nominální přetížení při 10% současnosti.
- Šířky 390, 768, 1024 a 1440 px: bez vodorovného přetečení celého dokumentu. Tabulky mají vlastní posun. Reálné snímky syntetického plánu, společného náhledu a oceněné části byly vizuálně zkontrolovány. Po kontrole odstraněny opakující se dlouhé popisky cen; podklady a technické detaily jsou sbalené.
- Soukromý projekt nalezený v místní ignorované složce předchozího ověření byl lokálně importován, obnoven po F5 a zpracován novým návrhem. Zachovány prvky, existující trasy a vazby; ověřeno undo návrhu. Jeho JSON, geometrie ani snímky nejsou součástí změn ani CI.
- Konzole běžných scénářů bez chyb; očekávané chyby obnovy a kolize revizí jsou povoleny pouze v odpovídajících původních regresích. Síťové nasazení a CI se ověřují samostatně po push.

## Přijatá zjednodušení a meze

- Bez fyzické trasy jde o součet hrubých vzdáleností značek, ne průchod zdmi / zónami. Sdílená drážka těchto odhadů je neznámá. Souběhy jsou pouze přesně shodné vodorovné a svislé části; svislé souběhy, blízké paralelní a diagonální úseky se neslučují.
- Předpoklad konců 1 m/okruh, montážní rezerva 10 % jednou; svislé vedení standardně neznámé. Příkon z lumenů používá nastavenou účinnost. Šablony nejsou štítkové hodnoty, při chybějícím účiníku se používá 1 a vícefázové větve bez rozpisu jsou symetrické. Úplný výpočet osvětlení zůstává v původním editoru.
- Varianta rozvaděče s jedním RCBO na okruh je prostorový odhad. Neprobíhá hospodářské porovnání variant společných RCD/RCBO, detailní DIN konstruktor ani konečný výběr ochran. Chybějící síť, uložení, seskupení, teplota, zkratové poměry / impedance, úbytek napětí a údaje zařízení brání ověřenému výběru ochrany a průřezů.
- Ovládání světel vyžaduje skutečné zapojení; odhad přívodu nesmí být vydáván za hotovou topologii. Ruční trasy se automaticky nedoplňují ani nepřepisují, neúplné úseky zůstávají chybějící.
- Přístrojové krabice jsou odhad 1 na mechanismus. Rámečky, SPD, rozvaděčové příslušenství, spotřební materiál, typ podkladu a dodatečné práce je třeba doplnit; vlastní řádky rozpočtu a finální nabídka nejsou v tomto minimu implementovány. Ceny jsou vlastní v Kč bez automatického DPH nebo katalogových cen.
- Skupina ×N ukládá jednotlivé kusy na stejném místě jako potřebu místnosti; před přesnou ruční trasou je lze rozmístit. Množství není prostorový návrh montáže.
- Ověření UX provedl autor změny podle reálných snímků a ovládání v Chrome; neproběhl nezávislý test s dalším elektrikářem. Nebyl testován fyzický dotykový telefon, jiné prohlížeče ani chování všech historických souborů.

---

# Ověření ElektroPlan 0.2.1

Datum: 26. 11. 2026. Výchozí main: `8923213b52a22ddad4e0772ed2a1885ef32cb89f`.

## Reprodukované a opravené chyby

- **Nerovnoměrné vícefázové větve:** automatické vyvážení nabízelo jen vzestupné kombinace fází. Pro větve 20/10 A a pevné jednofázové zátěže 20/10/30 A vracelo 40 A na nejzatíženější fázi, přestože prohozením větví vznikne 30/30/30 A. Nyní zvažuje také pořadí nerovnoměrných větví; zadané fixace zůstávají závazné. Ověřen i analogický případ 3N. Výkon ani současnost se za účelem skrytí přetížení nemění.
- **Dřívější spotřebič bez připojení:** opakovaný návrh ignoroval vhodnou zásuvku, pokud již měla vlastní navržený okruh. Spotřebič nyní může být připojen ke kompatibilnímu volnému bodu ve stejné jednoznačně určené místnosti. Nadbytečný prázdný návrh se odstraní, fixace fáze se přenese; odlišné fixace a samostatné spotřebiče na společném okruhu automatické sloučení blokují. Existující trasy se nemění. Pokud připojení nelze doplnit, náhled to sdělí místo hlášení o hotovém přiřazení.
- **Vlastní název kabelu:** návrh trasy neuměl vybrat kabel mimo výchozí seznam. Při dokončení pak vznikl prázdný název, neplatný JSON a selhalo automatické ukládání. Vlastní kabel je nyní zachován ve výběru i v trase.
- **Záporný svislý úsek:** zadání se tiše změnilo na nulu. Nyní se nepřijme; uživatel dostane opravitelnou chybu a rozpracovaná trasa zůstane zachována.
- **Změna nástroje:** rozpracovaná trasa se bez dotazu zahodila, přestože přechod mezi pracovními kroky již ochranu měl. Změna nástroje a klávesové zkratky nyní používají stejnou ochranu. Zrušené potvrzení zachová body i jejich undo/redo.
- **Zdvojené ovládání:** odstraněna druhá totožná sada odkazů na výpočet, bilanci a osvětlení v pracovních obrazovkách; moduly zůstávají dostupné v bočním panelu. Patka již nevyzývá k ručnímu ukládání před každým zavřením, když je místní automatická záloha v pořádku.
- **Konzole:** odstraněn zbytečný požadavek na chybějící favicon. Běžné E2E scénáře nyní vyžadují prázdnou konzoli chyb; očekávané chyby obnovy a konfliktu revizí se povolují jen v příslušných chybových scénářích.

## Provedené kontroly

Výpočtové jádro: původních 41 kontrol a čtyři nové regrese. Samostatné kontrolní příklady používají I=P/U pro 1N, 7200/(2×230) pro 2N a P/(√3×400) pro symetrické 3N. Ověřen neznámý příkon, štítkové proudy, konflikty fixací a rezerva zásuvkových okruhů bez dvojího započtení.

Lokální úplný běh: **45 kontrol jádra a 18 browser scénářů prošlo**. Skutečný Chrome 158 / Playwright, bez mock DOM:

- Prázdný projekt → místnost a dveře s úpravou šířky → zásuvky, spotřebič, rozvaděč a svítidlo → návrh okruhů → navržená trasa → výkaz, export a obnovení po F5.
- Šest pracovních kroků, zachování filtrů vrstev, vlastnosti, zoom, pan myší, přesun připojené zásuvky s aktualizací trasy, změna rohu a undo/redo.
- Ovládací skupina 6–7–6 a atomické undo/redo. Zkratky Ctrl+Z/Y v Chrome a události s ruskými znaky při fyzických kódech KeyZ/KeyY. Ve vstupních polích zůstává nativní undo.
- Délky kabelů včetně svislého vedení a 10% rezervy, přesné souběhy, křížení, pracovní označení a CSV.
- Druh trasy a okruh jsou při nedokončené trase blokovány; po zrušení kresby jsou znovu dostupné. Tato ochrana již existovala a byla ověřena bez rozšiřování funkcí.
- Osvětlení: místnost 20 m², tok 4000 lm, UF 0,7 a MF 0,8 dávají 112 lx. Neznámé svítidlo se nezapočítává jako známá nulová zátěž.
- Nastavení současnosti, přesun fixace fáze při doplnění připojení, v15 export/reimport, staré verze 1–14 včetně obrázkového projektu a elektrické trasy v14.
- Poškozená záloha zůstává v IndexedDB a lze ji stáhnout. Druhá karta nesmí přepsat novější revizi. Export a navigace nezahodí odmítnutý rozpracovaný prvek.
- Šířky 390, 768, 1024 a 1440 px; dostupnost ovládacích tlačítek a absence vodorovného přetečení dokumentu.
- Soukromý projekt byl přečten z otevřené uživatelské karty a exportován pouze do místní ignorované složky. Lokální automatická kontrola ověřila obnovení, připojení spotřebičů, zachování tras i undo návrhu. Jeho JSON, geometrie ani obrázek nejsou součástí repozitáře.

## Hranice ověření

- Výpočet zůstává orientační. Nebyla provedena normová kontrola jištění, průřezů, ochrany, proudu N ani reálné trasy ve stavbě. Automatický návrh trasy vyžaduje kontrolu průchodů a překážek.
- Rozpracované body nejsou součástí v15 ani IndexedDB; chrání je potvrzení před ztrátou, nikoli obnovení po pádu prohlížeče.
- Starší verze byly ověřeny na malých kontrolních projektech, nikoli na všech historicky vzniklých souborech. Nebyl testován Safari, Firefox ani fyzický dotykový telefon. Ruské klávesy byly ověřeny jako browser KeyboardEvent se správným fyzickým kódem, nikoli přepnutím systémového rozložení Windows.
- Chyby zápisu byly prověřeny přes konflikt revizí a poškozenou zálohu, nikoli vyčerpáním skutečné diskové kvóty nebo výpadkem napájení.
- Přímé předání souboru přes rozšíření Chrome vyžadovalo nepovolený přístup k lokálním souborům; soukromý JSON byl proto ověřen pomocí samostatného testovacího Chrome bez změny oprávnění rozšíření.
- Při výchozím běhu se soukromý test přeskočí. Lokální úplný běh vyžaduje cestu k vlastnímu souboru. Konkrétní stav veřejného nasazení se ověřuje samostatně po odeslání commitů.
