# Karel Ulrych – v16 spolehlivé odesílání Web3Forms

Tato verze opravuje odesílání objednávkového formuláře.

Změna:
- formulář se nově odesílá nativně přes HTML POST na Web3Forms,
- JavaScript už neblokuje odeslání přes `fetch`,
- AI třídění Normal / Hot / Priorita se doplní do skrytých polí ještě před odesláním,
- poptávka se dál ukládá do lokální administrace v prohlížeči.

Důležité nastavení ve Web3Forms:
1. V levém menu otevřete **Linked Emails**.
2. Přidejte a potvrďte e-mail `ulrych.k@seznam.cz`, pokud ještě není ověřený.
3. U formuláře zkontrolujte, že Access Key patří k e-mailu `ulrych.k@seznam.cz`.
4. V **Submissions** ověřte, zda tam objednávka od Petry Košťálové je.
5. Zkontrolujte složky Spam / Hromadné / Promo u seznam.cz.
