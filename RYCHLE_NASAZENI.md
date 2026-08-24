# RYCHLÉ NASAZENÍ NA karelulrych.cz

Toto je hotový statický web. Pro nasazení stačí nahrát OBSAH této složky do web rootu hostingu domény karelulrych.cz.

## Nejjednodušší postup přes běžný hosting
1. Přihlaste se do administrace hostingu.
2. Otevřete Souborový manažer nebo FTP.
3. Najděte složku web root: public_html / www / htdocs.
4. Smažte nebo přesuňte starý obsah.
5. Nahrajte všechny soubory z této složky tak, aby `index.html` byl přímo v kořeni.
6. Otevřete https://www.karelulrych.cz a ověřte web.

## Formulář a AI agent
Ve stránce `kontakt.html` je formulář:
`<form id="mystic-funnel-form" class="form" data-webhook-url="">`

Pro odesílání poptávek doplňte webhook URL z Make / Zapier / n8n:
`data-webhook-url="https://vas-webhook"`

Bez webhooku se výsledek zobrazí klientce pouze na webu.

## AI agent
Hotové podklady jsou ve složce:
`automation/`

Doporučený režim:
příchozí formulář/e-mail → AI agent vytěží informace → připraví návrh odpovědi → člověk schválí → až poté odeslat.
