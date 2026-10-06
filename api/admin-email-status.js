const crypto = require('crypto');

function authorized(req) {
  const expected = process.env.ADMIN_TOKEN || '';
  const provided = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return Boolean(expected) && left.length === right.length && crypto.timingSafeEqual(left, right);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!authorized(req)) return res.status(401).json({ error: 'Nesprávné heslo.' });
  try {
    const response = await fetch('https://api.resend.com/emails?limit=20', {
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY || ''}` },
      cache: 'no-store'
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) return res.status(502).json({ error: 'Stav e-mailů se nepodařilo načíst.' });
    const emails = (result.data || [])
      .filter(email => (email.to || []).includes('ulrych.k@seznam.cz'))
      .map(email => ({ createdAt: email.created_at, subject: email.subject, lastEvent: email.last_event }));
    return res.status(200).json({ emails });
  } catch (error) {
    console.error('Email status error', error);
    return res.status(500).json({ error: 'Stav e-mailů se nepodařilo načíst.' });
  }
};
