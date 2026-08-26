/**
 * Karel Ulrych – AI agent pro objednávky
 * - vypočítá prioritu Normal / Hot / Priorita
 * - doplní ji do formuláře odesílaného na ulrych.k@seznam.cz
 * - uloží záznam do lokální administrace admin.html ke schválení
 *
 * Poznámka: statický web neumí bezpečně držet API klíče ani číst e-mailovou schránku.
 * Tento agent zpracovává webové objednávky na straně prohlížeče.
 */

(function () {
  const ADMIN_KEY = "ku_orders";

  function normalize(text) {
    return (text || "").toString().toLowerCase();
  }

  function classifyOrder(data) {
    const message = normalize(data.zprava);
    const service = normalize(data.sluzba);
    const term = normalize(data.termin);
    const contact = normalize(data.preferovany_kontakt);
    const phone = normalize(data.telefon);

    const priorityWords = [
      "urgent", "hned", "okamžitě", "dnes", "zítra", "krize",
      "rozchod", "rozvod", "nevěra", "panika", "strach", "kolaps",
      "nespím", "nemůžu spát", "zoufal", "priorita"
    ];

    const hotWords = [
      "vztah", "partner", "partnerka", "manžel", "manželka", "budoucnost",
      "rozhodnutí", "práce", "změna", "termín", "reiki", "karty",
      "horoskop", "prognóza", "partnerský"
    ];

    let score = 0;
    const reasons = [];

    if (phone.trim().length > 5) {
      score += 2;
      reasons.push("klientka uvedla telefon");
    }
    if (contact.includes("telefon") || contact.includes("sms")) {
      score += 2;
      reasons.push("preferuje rychlý kontakt");
    }
    if (term.includes("dnes") || term.includes("zítra") || term.includes("co nejdřív")) {
      score += 4;
      reasons.push("žádá rychlý termín");
    }
    if (service.includes("prognóza") || service.includes("partnerský") || service.includes("nejsem si jist")) {
      score += 2;
      reasons.push("služba vyžaduje osobnější vedení");
    }

    priorityWords.forEach((word) => {
      if (message.includes(word) || term.includes(word)) {
        score += 4;
        reasons.push("obsahuje naléhavé téma: " + word);
      }
    });

    hotWords.forEach((word) => {
      if (message.includes(word) || service.includes(word)) {
        score += 1;
      }
    });

    let label = "Normal";
    if (score >= 8) label = "Priorita";
    else if (score >= 4) label = "Hot";

    if (reasons.length === 0) {
      reasons.push("běžná poptávka bez výrazné naléhavosti");
    }

    const summary = [
      "Služba: " + (data.sluzba || "neuvedeno"),
      "Klientka/klient: " + (data.jmeno || "neuvedeno"),
      "Kontakt: " + (data.email || "neuvedeno") + (data.telefon ? ", " + data.telefon : ""),
      "Termín: " + (data.termin || "neuvedeno"),
      "Téma: " + ((data.zprava || "").trim().slice(0, 260) || "neuvedeno")
    ].join(" | ");

    return {
      label,
      score,
      reason: reasons.slice(0, 4).join("; "),
      summary
    };
  }

  function getFormData(form) {
    const fd = new FormData(form);
    return Object.fromEntries(fd.entries());
  }

  function saveToAdmin(data, ai) {
    const orders = JSON.parse(localStorage.getItem(ADMIN_KEY) || "[]");
    orders.unshift({
      id: "KU-" + new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14),
      createdAt: new Date().toLocaleString("cs-CZ"),
      status: "Čeká na schválení",
      ai,
      data
    });
    localStorage.setItem(ADMIN_KEY, JSON.stringify(orders.slice(0, 200)));
  }

  function handleContactForm() {
    const form = document.getElementById("contact-form");
    if (!form) return;

    const status = document.getElementById("form-status");
    const params = new URLSearchParams(window.location.search);
    if (params.get("odeslano") === "1" && status) {
      status.textContent = "Děkuji, poptávka byla odeslána na e-mail a zařazena ke zpracování.";
    }

    form.addEventListener("submit", function (event) {
      if (!form.checkValidity()) return;

      const data = getFormData(form);
      const ai = classifyOrder(data);

      const p = document.getElementById("ai-priority");
      const r = document.getElementById("ai-reason");
      const s = document.getElementById("ai-summary");
      const subject = document.getElementById("ai-subject");

      if (p) p.value = ai.label;
      if (r) r.value = ai.reason;
      if (s) s.value = ai.summary;
      if (subject) subject.value = "[" + ai.label + "] Nová objednávka – " + (data.sluzba || "služba");

      saveToAdmin(data, ai);

      if (status) {
        status.textContent = "AI agent zařadil poptávku jako " + ai.label + ". Odesílám na ulrych.k@seznam.cz…";
      }
    });
  }

  function escapeHtml(value) {
    return (value || "").toString().replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char];
    });
  }

  function mailtoFor(order) {
    const d = order.data || {};
    const subject = encodeURIComponent("Odpověď k objednávce – " + (d.sluzba || ""));
    const body = encodeURIComponent(
      "Dobrý den,\n\n" +
      "děkuji za Vaši poptávku: " + (d.sluzba || "") + ".\n\n" +
      "Navrhuji další postup:\n\n\n" +
      "S úctou\nIng. Karel Ulrych\n"
    );
    return "mailto:" + encodeURIComponent(d.email || "") + "?subject=" + subject + "&body=" + body;
  }

  function renderAdmin() {
    const root = document.getElementById("admin-orders");
    if (!root) return;

    const orders = JSON.parse(localStorage.getItem(ADMIN_KEY) || "[]");
    const counts = orders.reduce((acc, o) => {
      acc[o.ai.label] = (acc[o.ai.label] || 0) + 1;
      return acc;
    }, { Normal: 0, Hot: 0, Priorita: 0 });

    const cards = `
      <div class="admin-stats">
        <div class="card"><strong>Normal</strong><span>${counts.Normal || 0}</span></div>
        <div class="card"><strong>Hot</strong><span>${counts.Hot || 0}</span></div>
        <div class="card"><strong>Priorita</strong><span>${counts.Priorita || 0}</span></div>
      </div>
    `;

    if (orders.length === 0) {
      root.innerHTML = cards + '<div class="card"><p>Zatím zde není žádná objednávka z tohoto prohlížeče.</p><p>Nové poptávky zároveň chodí na e-mail <strong>ulrych.k@seznam.cz</strong>.</p></div>';
      return;
    }

    const rows = orders.map((o, idx) => {
      const d = o.data || {};
      const cls = o.ai.label === "Priorita" ? "priority" : o.ai.label === "Hot" ? "hot" : "normal";
      return `
        <article class="card admin-order ${cls}">
          <div class="admin-row">
            <div>
              <span class="pill-soft">${escapeHtml(o.ai.label)}</span>
              <h3>${escapeHtml(d.sluzba || "Bez služby")}</h3>
              <p><strong>${escapeHtml(d.jmeno || "")}</strong> · ${escapeHtml(d.email || "")} · ${escapeHtml(d.telefon || "")}</p>
              <p><strong>Vytvořeno:</strong> ${escapeHtml(o.createdAt)} · <strong>Stav:</strong> ${escapeHtml(o.status)}</p>
            </div>
            <div class="admin-actions">
              <a class="btn primary" href="${mailtoFor(o)}">Připravit odpověď</a>
              <button class="btn ghost" data-approve="${idx}">Schválit</button>
              <button class="btn ghost" data-delete="${idx}">Smazat</button>
            </div>
          </div>
          <p><strong>AI důvod:</strong> ${escapeHtml(o.ai.reason)}</p>
          <p><strong>Souhrn:</strong> ${escapeHtml(o.ai.summary)}</p>
          <p><strong>Téma:</strong><br>${escapeHtml(d.zprava || "")}</p>
        </article>
      `;
    }).join("");

    root.innerHTML = cards + rows;

    root.querySelectorAll("[data-approve]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-approve"));
        orders[i].status = "Schváleno Karlem";
        localStorage.setItem(ADMIN_KEY, JSON.stringify(orders));
        renderAdmin();
      });
    });

    root.querySelectorAll("[data-delete]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = Number(btn.getAttribute("data-delete"));
        if (confirm("Opravdu smazat objednávku z lokální administrace?")) {
          orders.splice(i, 1);
          localStorage.setItem(ADMIN_KEY, JSON.stringify(orders));
          renderAdmin();
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    handleContactForm();
    renderAdmin();
  });
})();
