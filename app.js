
(function(){
  const data = {
    ja: {
      title: "Osobní horoskop",
      price: "1 200 Kč",
      text: "Nejvhodnější volba, pokud chcete lépe pochopit sama sebe, svoje talenty, opakující se témata a vnitřní nastavení.",
      link: "kontakt.html?sluzba=osobni-horoskop"
    },
    vztah: {
      title: "Partnerský horoskop",
      price: "1 200 Kč",
      text: "Doporučení pro vztahová témata, kompatibilitu, rozdíly mezi partnery a hlubší pochopení vztahové dynamiky.",
      link: "kontakt.html?sluzba=partnersky-horoskop"
    },
    budoucnost: {
      title: "Prognóza na 3 roky",
      price: "1 500 Kč",
      text: "Vhodné při životní změně, nové etapě nebo potřebě vidět širší časový rámec a hlavní témata dalších let.",
      link: "kontakt.html?sluzba=prognoza-3-roky"
    },
    rozhodnuti: {
      title: "OSHO Zen Tarot",
      price: "800 Kč",
      text: "Jemný vhled do aktuální situace, rozhodování a vnitřního postoje. Neřeší tlakem, ale přítomným pochopením.",
      link: "kontakt.html?sluzba=osho-zen-tarot"
    },
    energie: {
      title: "Léčení Reiki",
      price: "500 Kč",
      text: "Doporučení pro zklidnění, uvolnění, harmonizaci a energetickou podporu v období únavy nebo vnitřního tlaku.",
      link: "kontakt.html?sluzba=reiki"
    },
    duchovni: {
      title: "Čakrové karty",
      price: "1 200 Kč",
      text: "Výklad zaměřený na léčení mysli, těla i ducha, energetická témata a návrat k vnitřní rovnováze.",
      link: "kontakt.html?sluzba=cakrove-karty"
    }
  };
  const btn = document.getElementById("recommendBtn");
  const select = document.getElementById("topic");
  const out = document.getElementById("recommendation");
  if(btn && select && out){
    btn.addEventListener("click", function(){
      const item = data[select.value];
      if(!item){
        out.className = "recommendation show";
        out.innerHTML = "<strong>Vyberte oblast</strong><p>Nejdřív zvolte, co právě nejvíc řešíte. Potom vám doporučím vhodnou službu.</p>";
        return;
      }
      out.className = "recommendation show";
      out.innerHTML = `<strong>${item.title}</strong><p>${item.text}</p><p><b>Cena: ${item.price}</b></p><a class="btn primary" href="${item.link}">Poptat tuto službu</a>`;
    });
  }

  const form = document.getElementById("mystic-funnel-form");
  if(form){
    form.addEventListener("submit", async function(e){
      e.preventDefault();
      const result = document.getElementById("form-result");
      const data = Object.fromEntries(new FormData(form).entries());
      const webhook = form.getAttribute("data-webhook-url");
      if(webhook){
        try{
          await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
        }catch(err){}
      }
      if(result){
        result.innerHTML = "<strong>Děkuji, zpráva je připravená.</strong><br>Pokud je napojený webhook, odešle se ke zpracování. Bez webhooku slouží formulář jako lokální ukázka.";
        result.className = "recommendation show";
      }
    });
  }

  const contactForm = document.getElementById("contact-form");
  if(contactForm){
    const params = new URLSearchParams(window.location.search);
    const serviceMap = {
      "osobni-horoskop": "Osobní horoskop – 1 200 Kč",
      "partnersky-horoskop": "Partnerský horoskop – 1 200 Kč",
      "prognoza-3-roky": "Prognóza na 3 roky – 1 500 Kč",
      "samanske-orakulum": "Mystické Šamanské Orákulum – 1 000 Kč",
      "osho-zen-tarot": "OSHO Zen Tarot – 800 Kč",
      "cakrove-karty": "Čakrové karty – 1 200 Kč",
      "reiki": "Léčení Reiki – 500 Kč"
    };
    const serviceSelect = document.getElementById("service-select");
    const requested = params.get("sluzba");
    if(serviceSelect && requested && serviceMap[requested]){
      serviceSelect.value = serviceMap[requested];
    }

    contactForm.addEventListener("submit", async function(e){
      e.preventDefault();
      const status = document.getElementById("form-status");
      const data = Object.fromEntries(new FormData(contactForm).entries());
      const lines = [
        "Dobrý den, pane Ulrychu,",
        "",
        "ráda bych objednala / poptala službu:",
        data.sluzba || "",
        "",
        "Jméno: " + (data.jmeno || ""),
        "E-mail: " + (data.email || ""),
        "Telefon: " + (data.telefon || ""),
        "",
        "Datum narození: " + (data.datum_narozeni || ""),
        "Čas narození: " + (data.cas_narozeni || ""),
        "Místo narození: " + (data.misto_narozeni || ""),
        "",
        "Preferovaný kontakt: " + (data.preferovany_kontakt || ""),
        "Ideální termín: " + (data.termin || ""),
        "",
        "Téma / zpráva:",
        data.zprava || "",
        "",
        "Děkuji a prosím o návrh dalšího postupu.",
        "",
        "Odesláno z webu www.karelulrych.cz"
      ];
      const subject = "Objednávka konzultace – " + (data.sluzba || "Karel Ulrych");
      const mailto = "mailto:ulrych.k@seznam.cz?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));

      const webhook = contactForm.getAttribute("data-webhook-url");
      if(webhook){
        try{
          await fetch(webhook,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
        }catch(err){}
      }

      if(status){
        status.innerHTML = "E-mailová poptávka je připravená. Otevře se váš e-mailový program – stačí zkontrolovat text a odeslat.";
        status.className = "form-status ok";
      }
      window.location.href = mailto;
    });
  }

})();


// AI agent v7 – lokální testovací klasifikace a příprava schvalovacího e-mailu
(function(){
  const form = document.getElementById('aiMailForm');
  if(!form) return;

  const serviceRules = [
    {key:'partnerský horoskop', service:'Partnerský horoskop', words:['partner','partnerský','vztah','manžel','přítel','rozchod','kompatibilita']},
    {key:'osobní horoskop', service:'Osobní horoskop', words:['osobní','horoskop','datum narození','čas narození','já','talent','životní cesta']},
    {key:'prognóza', service:'Prognóza na 3 roky', words:['budoucnost','prognóza','3 roky','tři roky','další roky','výhled']},
    {key:'reiki', service:'Léčení Reiki', words:['reiki','energie','únava','harmonizace','zklidnění','uvolnění']},
    {key:'tarot', service:'OSHO Zen Tarot / výklad karet', words:['tarot','karty','výklad','orákulum','šamanské','osho','čakrové']}
  ];

  function classify(text){
    const t = (text || '').toLowerCase();
    const hasOrder = ['objednat','objednávám','chci','prosím o','termín','cena','zaplatit','platba'].some(w => t.includes(w));
    const hasUrgent = ['dnes','hned','urgentní','co nejdřív','rychle','akutně','změna termínu','platba','zaplatila','opakovaně'].some(w => t.includes(w));
    const hasSensitive = ['krize','nemoc','deprese','úzkost','panika','léky','soud','právník','dluh','sebevraž'].some(w => t.includes(w));

    let priority = 'Normal';
    if(hasOrder) priority = 'Hot';
    if(hasUrgent || hasSensitive) priority = 'Priorita';

    let service = 'Neurčeno – doporučit podle tématu';
    let best = 0;
    serviceRules.forEach(rule => {
      const score = rule.words.reduce((sum,w)=> sum + (t.includes(w) ? 1 : 0), 0);
      if(score > best){ best = score; service = rule.service; }
    });

    const missing = [];
    if(!/\b\d{1,2}\.\s?\d{1,2}\.\s?\d{4}\b/.test(t)) missing.push('datum narození');
    if(!/\b\d{1,2}:\d{2}\b/.test(t) && !t.includes('čas narození')) missing.push('čas narození');
    if(!['místo narození','narozena v','narozená v'].some(w => t.includes(w))) missing.push('místo narození');

    return {priority, service, missing, hasSensitive};
  }

  form.addEventListener('submit', function(e){
    e.preventDefault();
    const fd = new FormData(form);
    const clientName = fd.get('clientName') || 'Neuvedeno';
    const clientEmail = fd.get('clientEmail') || 'Neuvedeno';
    const subject = fd.get('subject') || 'Poptávka z webu';
    const message = fd.get('message') || '';
    const result = classify(subject + ' ' + message);

    const approvalNote = result.hasSensitive
      ? 'POZOR: Zpráva obsahuje citlivější téma. Doporučeno osobní a opatrné posouzení. AI nesmí odeslat odpověď sama.'
      : 'Výstup je připraven ke schválení. AI sama neodesílá odpověď klientce.';

    const draftReply = `Dobrý den,\n\nděkuji za zprávu a důvěru. Podle toho, co píšete, by pro vás mohla být vhodná služba: ${result.service}.\n\nAbych mohl připravit přesnější odpověď, prosím ještě o doplnění: ${result.missing.length ? result.missing.join(', ') : 'údaje jsou zřejmě kompletní'}.\n\nS úctou\nIng. Karel Ulrych`;

    const body =
`AI AGENT – REPORT KE SCHVÁLENÍ

Kategorie: ${result.priority}
Typ: Poptávka / zpráva z webu
Doporučená služba: ${result.service}
Klientka: ${clientName}
E-mail klientky: ${clientEmail}
Předmět: ${subject}

Chybějící údaje:
${result.missing.length ? '- ' + result.missing.join('\n- ') : 'Žádné zásadní chybějící údaje nerozpoznány.'}

Bezpečnostní poznámka:
${approvalNote}

Původní zpráva:
${message}

NÁVRH ODPOVĚDI KE SCHVÁLENÍ:
${draftReply}

STAV:
Odeslat klientce: NE
Čeká na schválení: Ing. Karel Ulrych`;

    const mailto = 'mailto:ulrych.k@seznam.cz'
      + '?subject=' + encodeURIComponent('[AI agent][' + result.priority + '] ' + subject)
      + '&body=' + encodeURIComponent(body);

    const status = document.getElementById('aiMailStatus');
    if(status){
      status.className = 'form-status ok';
      status.textContent = 'Report je připraven. Otevře se e-mail na ulrych.k@seznam.cz ke schválení.';
    }
    window.location.href = mailto;
  });
})();
