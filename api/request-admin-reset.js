const { redis } = require('./_orders');
const { createResetToken } = require('./_admin-auth');

const RECIPIENT = 'ulrych.k@seznam.cz';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = forwarded || 'unknown';
    const allowed = await redis(['SET', `karelulrych:admin:reset-limit:${ip}`, '1', 'NX', 'EX', 60]);
    if (!allowed) {
      return res.status(429).json({ error: 'E-mail už byl odeslaný. Počkej chvíli, než si vyžádáš další.' });
    }

    const token = await createResetToken();
    const baseUrl = `https://${req.headers.host || 'www.karelulrych.cz'}`;
    const resetUrl = `${baseUrl}/admin.html?reset=${encodeURIComponent(token)}`;
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is missing');

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.ORDER_FROM_EMAIL || 'Karel Ulrych <objednavky@karelulrych.cz>',
        to: [RECIPIENT],
        subject: 'Nastavení nového hesla administrace',
        html: `<p>Přišel požadavek na nastavení nového hesla administrace webu karelulrych.cz.</p><p><a href="${resetUrl}">Nastavit nové heslo</a></p><p>Odkaz platí 15 minut a lze ho použít jen jednou. Pokud jsi o změnu nežádal, tento e-mail ignoruj.</p>`
      })
    });

    if (!response.ok) throw new Error('Reset email failed');
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Admin reset request error', error);
    return res.status(500).json({ error: 'E-mail se nepodařilo odeslat. Zkuste to za chvíli znovu.' });
  }
};
