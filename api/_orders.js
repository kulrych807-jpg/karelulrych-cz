const ORDERS_KEY = 'karelulrych:orders';

async function redis(command) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Úložiště objednávek není nastavené.');
  const path = command.map(value => encodeURIComponent(String(value))).join('/');
  const response = await fetch(`${url}/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || body.error) throw new Error(body.error || 'Úložiště objednávek neodpovídá.');
  return body.result;
}

async function storeOrder(order) {
  await redis(['LPUSH', ORDERS_KEY, JSON.stringify(order)]);
  await redis(['LTRIM', ORDERS_KEY, 0, 999]);
}

async function listOrders() {
  const rows = await redis(['LRANGE', ORDERS_KEY, 0, 999]);
  return (rows || []).map(row => JSON.parse(row));
}

module.exports = { storeOrder, listOrders };
