# Make / n8n napojení pro plně autonomnější AI agenta

Statický web už odesílá poptávku na ulrych.k@seznam.cz a provádí základní třídění Normal / Hot / Priorita.

Pro centrální administraci ze všech zařízení doporučený další krok:

1. Trigger: nová odpověď z formuláře / webhook / Gmail nové zprávy.
2. AI krok: OpenAI / ChatGPT analyzuje zprávu.
3. Výstup:
   - priorita: Normal / Hot / Priorita
   - typ: objednávka / dotaz / reklamace / technický problém / jiné
   - doporučená služba
   - stručný souhrn
   - návrh odpovědi
4. Uložení: Google Sheet / Airtable / Notion jako administrace.
5. E-mail Karlovi: souhrn + návrh odpovědi.
6. Lidské schválení: odpověď klientce se odešle až po potvrzení Karlem.

Bezpečnostní pravidlo:
Nikdy neposílat citlivé, zdravotní, právní, finanční nebo psychologické odpovědi automaticky bez schválení.
