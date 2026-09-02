const RECIPIENT = 'ulrych.k@seznam.cz';

function esc(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      jmeno = '', email = '', telefon = '', sluzba = '',
      datum_narozeni = '', cas_narozeni = '', misto_narozeni = '',
      zprava = '', souhlas = false, website = ''
    } = req.body || {};

    if (website) return res.status(200).json({ ok: true });
    if (!jmeno || !email || !sluzba || !souhlas) {
      return res.status(400).json({ error: 'Chybí povinné údaje.' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Neplatný e-mail.' });
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('RESEND_API_KEY is missing');
      return res.status(500).json({ error: 'E-mailová služba není nastavena.' });
    }

    const from = process.env.ORDER_FROM_EMAIL || 'Karel Ulrych <onboarding@resend.dev>';
    const subject = `Nová objednávka – ${String(sluzba).slice(0, 100)}`;
    const html = `
      <h2>Nová objednávka z karelulrych.cz</h2>
      <p><strong>Jméno:</strong> ${esc(jmeno)}</p>
      <p><strong>E-mail:</strong> ${esc(email)}</p>
      <p><strong>Telefon:</strong> ${esc(telefon)}</p>
      <p><strong>Služba:</strong> ${esc(sluzba)}</p>
      <hr>
      <p><strong>Datum narození:</strong> ${esc(datum_narozeni)}</p>
      <p><strong>Čas narození:</strong> ${esc(cas_narozeni)}</p>
      <p><strong>Místo narození:</strong> ${esc(misto_narozeni)}</p>
      <p><strong>Téma / zpráva:</strong><br>${esc(zprava).replace(/\n/g, '<br>')}</p>
      <hr>
      <p>Souhlas se zpracováním údajů: ano</p>`;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [RECIPIENT],
        reply_to: email,
        subject,
        html
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Resend error', response.status, result);
      return res.status(502).json({ error: 'E-mail se nepodařilo odeslat.' });
    }

    return res.status(200).json({ ok: true, id: result.id || null });
  } catch (error) {
    console.error('Order API error', error);
    return res.status(500).json({ error: 'Objednávku se nepodařilo odeslat.' });
  }
};
