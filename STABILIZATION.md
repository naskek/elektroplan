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
