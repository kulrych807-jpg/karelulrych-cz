# Nastavení Make scénáře pro objednávky z karelulrych.cz

Webhook je už vložený do webu:

https://hook.eu1.make.com/5634bn2d9m4y7d0267lbkrifjmm2k1ae

## Doporučený scénář v Make

### 1. Webhooks – Custom webhook
Název:
Objednávky karelulrych.cz

Tento modul přijímá formulář z webu.

### 2. Tools / JSON nebo Text parser – volitelné
Make obvykle načte položky formuláře automaticky. Zkontrolujte, že vidíte pole:

- jmeno
- email
- telefon
- sluzba
- datum_narozeni
- cas_narozeni
- misto_narozeni
- preferovany_kontakt
- termin
- zprava
- Interní třídění
- Důvod třídění
- Souhrn poptávky
- odeslano_z_webu

### 3. Google Sheets – Add a Row
Vytvořte tabulku s těmito sloupci:

Datum | Jméno | E-mail | Telefon | Služba | Datum narození | Čas narození | Místo narození | Preferovaný kontakt | Termín | Zpráva | AI štítek | AI souhrn | Důvod třídění | Doporučený další krok | Stav

Doporučený stav pro novou poptávku:
Nová

### 4. AI třídění v Make
Základní štítek už posílá web jako pole `Interní třídění`.

Pro kvalitnější AI třídění přidejte modul AI / OpenAI / Make AI a použijte prompt:

---
Jsi interní asistent pro web karelulrych.cz. Zpracováváš poptávku na horoskop, výklad karet nebo Reiki.

Zařaď poptávku jako:
Normal – běžný dotaz, nejasný zájem, obecná otázka.
Hot – klientka vybrala konkrétní službu, má jasný zájem, uvedla kontakt, termín nebo podklady.
Priorita – klientka chce objednat hned, uvádí konkrétní údaje, řeší naléhavou vztahovou nebo životní situaci, nebo žádá rychlou odpověď.

Vrať:
1. štítek Normal/Hot/Priorita
2. stručný souhrn
3. důvod zařazení
4. doporučený další krok
5. návrh odpovědi pro Karla ke schválení

Nikdy neposílej odpověď klientce automaticky. Výstup je pouze pracovní návrh pro Ing. Karla Ulrycha.
---

### 5. E-mail – Send an email
Příjemce:

ulrych.k@seznam.cz

Předmět:

Nová poptávka z webu – {Interní třídění} – {jmeno}

Tělo e-mailu:

Nová poptávka z webu karelulrych.cz

AI štítek:
{Interní třídění}

Klientka:
{jmeno}

E-mail:
{email}

Telefon:
{telefon}

Služba:
{sluzba}

Datum narození:
{datum_narozeni}

Čas narození:
{cas_narozeni}

Místo narození:
{misto_narozeni}

Preferovaný kontakt:
{preferovany_kontakt}

Ideální termín:
{termin}

Zpráva:
{zprava}

Souhrn:
{Souhrn poptávky}

Důvod třídění:
{Důvod třídění}

Stav:
Čeká na schválení Karlem.

### 6. Webhook response – doporučeno
Na konec scénáře přidejte modul:

Webhooks → Webhook response

Status:
200

Body:
Objednávka přijata.

## Test

1. V Make klikněte na Run once.
2. Otevřete webovou stránku Kontakt.
3. Odešlete testovací objednávku.
4. V Make musí proběhnout scénář zeleně.
5. Zkontrolujte Google Sheets.
6. Zkontrolujte e-mail `ulrych.k@seznam.cz`.

Hotovo je až tehdy, když poptávka projde všemi třemi místy:
Make historie → Google Sheets → e-mail.
