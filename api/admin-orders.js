const crypto = require('crypto');
const { listOrders } = require('./_orders');

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
    const orders = await listOrders();
    const rank = { Hot: 0, Priorita: 1, Normal: 2 };
    orders.sort((a, b) => (rank[a.priority] ?? 3) - (rank[b.priority] ?? 3) || String(b.createdAt).localeCompare(String(a.createdAt)));
    return res.status(200).json({ orders });
  } catch (error) {
    console.error('Admin orders error', error);
    return res.status(500).json({ error: 'Objednávky se nepodařilo načíst.' });
  }
};
