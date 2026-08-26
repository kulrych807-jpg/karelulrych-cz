
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
})();
