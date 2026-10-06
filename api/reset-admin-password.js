const { consumeResetToken, setPassword } = require('./_admin-auth');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const token = String(req.body?.token || '');
    const password = String(req.body?.password || '');
    if (password.length < 10) {
      return res.status(400).json({ error: 'Nové heslo musí mít alespoň 10 znaků.' });
    }
    if (!await consumeResetToken(token)) {
      return res.status(400).json({ error: 'Odkaz už neplatí. Pošli si nový.' });
    }
    await setPassword(password);
    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Admin password reset error', error);
    return res.status(500).json({ error: 'Heslo se nepodařilo změnit.' });
  }
};
