(function () {
  function textValue(form, name) {
    const el = form.querySelector('[name="' + name + '"]');
    return el ? (el.value || '').trim() : '';
  }

  function classifyLead(form) {
    const service = textValue(form, 'sluzba').toLowerCase();
    const message = textValue(form, 'zprava').toLowerCase();
    const phone = textValue(form, 'telefon');
    const term = textValue(form, 'termin').toLowerCase();
    const birthDate = textValue(form, 'datum_narozeni');
    const birthTime = textValue(form, 'cas_narozeni');
    const birthPlace = textValue(form, 'misto_narozeni');

    const urgentWords = ['urgent', 'rychle', 'co nejdřív', 'dnes', 'zítra', 'hned', 'naléhav', 'krize', 'rozchod', 'nevěra', 'bolest', 'strach'];
    const orderWords = ['objednat', 'objednávám', 'chci', 'prosím o termín', 'termín', 'zaplatím', 'platba'];

    let score = 0;
    let reasons = [];

    if (service && !service.includes('nejsem si jist')) { score += 2; reasons.push('vybraná konkrétní služba'); }
    if (phone) { score += 1; reasons.push('uveden telefon'); }
    if (term) { score += 1; reasons.push('uveden preferovaný termín'); }
    if (birthDate || birthTime || birthPlace) { score += 1; reasons.push('doplněné podklady k výkladu'); }
    if (orderWords.some(w => message.includes(w) || term.includes(w))) { score += 2; reasons.push('jasný objednávkový záměr'); }
    if (urgentWords.some(w => message.includes(w) || term.includes(w))) { score += 3; reasons.push('naléhavé nebo citlivé téma'); }

    let label = 'Normal';
    if (score >= 4) label = 'Hot';
    if (score >= 6) label = 'Priorita';

    const summary = [
      'Služba: ' + (textValue(form, 'sluzba') || 'neuvedeno'),
      'Kontakt: ' + (textValue(form, 'email') || 'bez e-mailu') + (phone ? ', tel. ' + phone : ''),
      'Téma: ' + (textValue(form, 'zprava') || 'bez zprávy'),
      'Termín: ' + (textValue(form, 'termin') || 'neuveden')
    ].join('\n');

    return {
      label: label,
      reason: reasons.length ? reasons.join(', ') : 'běžná nebo neúplná poptávka',
      summary: summary
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const status = document.getElementById('form-status');
    if (!form) return;

    const iframe = document.getElementById('make-submit-frame');

    form.addEventListener('submit', function () {
      const website = textValue(form, 'website');
      if (website) {
        if (status) status.textContent = 'Odeslání bylo zastaveno antispamovou ochranou.';
        return false;
      }

      const firstName = textValue(form, 'jmeno') || textValue(form, 'email') || 'Objednávka z webu';
      const wfName = document.getElementById('wf-name');
      const priority = document.getElementById('ai-priority');
      const reason = document.getElementById('ai-reason');
      const summary = document.getElementById('ai-summary');
      const subject = document.getElementById('ai-subject');
      const sentAt = document.getElementById('sent-at');
      const ai = classifyLead(form);

      if (wfName) wfName.value = firstName;
      if (priority) priority.value = ai.label;
      if (reason) reason.value = ai.reason;
      if (summary) summary.value = ai.summary;
      if (subject) subject.value = 'Nová poptávka z webu – ' + ai.label + ' – ' + firstName;
      if (sentAt) sentAt.value = new Date().toISOString();

      try {
        const stored = JSON.parse(localStorage.getItem('ku_objednavky') || '[]');
        stored.unshift({
          datum: new Date().toLocaleString('cs-CZ'),
          jmeno: textValue(form, 'jmeno'),
          email: textValue(form, 'email'),
          telefon: textValue(form, 'telefon'),
          sluzba: textValue(form, 'sluzba'),
          zprava: textValue(form, 'zprava'),
          priorita: ai.label,
          duvod: ai.reason,
          stav: 'Odesláno do Make'
        });
        localStorage.setItem('ku_objednavky', JSON.stringify(stored.slice(0, 100)));
      } catch (e) {}

      if (status) {
        status.textContent = 'Odesílám poptávku do Make. Po odeslání zůstane odpověď klientce na schválení Karlem.';
      }

      if (iframe) {
        iframe.onload = function () {
          if (status) {
            status.textContent = 'Poptávka byla odeslána do Make. Zkontrolujte historii scénáře, Google Sheets a e-mail ulrych.k@seznam.cz.';
          }
          try { form.reset(); } catch (e) {}
        };
      }
    });
  });
})();
