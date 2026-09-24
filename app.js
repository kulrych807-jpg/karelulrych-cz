(function () {
  const recommendations = {
    ja: { title: "Osobní horoskop", text: "Pomůže vám lépe porozumět sobě, talentům a životním tématům.", href: "kontakt.html?sluzba=osobni-horoskop" },
    vztah: { title: "Partnerský horoskop", text: "Ukáže dynamiku vztahu, komunikaci, soulad i opakující se vzorce.", href: "kontakt.html?sluzba=partnersky-horoskop" },
    budoucnost: { title: "Prognóza na 3 roky", text: "Nabídne širší orientaci v důležitých obdobích, změnách a možnostech.", href: "kontakt.html?sluzba=prognoza-na-3-roky" },
    energie: { title: "Reiki léčení", text: "Prémiová služba zaměřená na zklidnění, uvolnění a energetickou harmonizaci.", href: "kontakt.html?sluzba=reiki" }
  };
  function initRecommendation() {
    const button = document.getElementById("recommendBtn");
    const topic = document.getElementById("topic");
    const output = document.getElementById("recommendation");
    if (!button || !topic || !output) return;
    button.addEventListener("click", function () {
      const item = recommendations[topic.value];
      if (!item) {
        output.textContent = "Nejprve vyberte oblast, kterou právě řešíte.";
        return;
      }
      output.innerHTML = "<h3>" + item.title + "</h3><p>" + item.text + "</p><a class=\"btn primary\" href=\"" + item.href + "\">Objednat službu</a>";
    });
  }
  document.addEventListener("DOMContentLoaded", initRecommendation);
})();
