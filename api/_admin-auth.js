const crypto = require('crypto');
const { redis } = require('./_orders');

const PASSWORD_KEY = 'karelulrych:admin:password';
const RESET_KEY = 'karelulrych:admin:reset';

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyHash(password, stored) {
  const [salt, expected] = String(stored || '').split(':');
  if (!salt || !expected) return false;
  const actual = crypto.scryptSync(String(password), salt, 64).toString('hex');
  return safeEqual(actual, expected);
}

async function verifyPassword(password) {
  const stored = await redis(['GET', PASSWORD_KEY]);
  if (stored) return verifyHash(password, stored);
  return Boolean(process.env.ADMIN_TOKEN) && safeEqual(password, process.env.ADMIN_TOKEN);
}

async function setPassword(password) {
  await redis(['SET', PASSWORD_KEY, hashPassword(password)]);
}

function hashResetToken(token) {
  return crypto.createHash('sha256').update(String(token)).digest('hex');
}

async function createResetToken() {
  const token = crypto.randomBytes(32).toString('hex');
  await redis(['SETEX', RESET_KEY, 900, hashResetToken(token)]);
  return token;
}

async function consumeResetToken(token) {
  const expected = await redis(['GET', RESET_KEY]);
  if (!expected || !safeEqual(hashResetToken(token), expected)) return false;
  await redis(['DEL', RESET_KEY]);
  return true;
}

module.exports = { verifyPassword, setPassword, createResetToken, consumeResetToken };
