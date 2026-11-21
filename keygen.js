const fs = require('fs');
const path = require('path');

let cachedKey = null;
let cachedExpiresAt = 0;

function readEnvValue(name) {
  if (process.env[name]) return process.env[name].trim();
  try {
    const env = fs.readFileSync(path.join(__dirname, '.env'), 'utf8');
    const line = env.split(/\r?\n/).find(item => item.startsWith(`${name}=`));
    return line ? line.slice(name.length + 1).trim() : '';
  } catch {
    return '';
  }
}

function keygenError(message, fix) {
  const error = new Error(message);
  error.fix = fix;
  return error;
}

function expiresAtMilliseconds(value) {
  const number = Number(value);
  if (Number.isFinite(number)) return number < 1e12 ? number * 1000 : number;
  const date = Date.parse(value);
  return Number.isFinite(date) ? date : 0;
}

async function getKey() {
  if (cachedKey && cachedExpiresAt > Date.now()) return cachedKey;

  const keygenUrl = readEnvValue('KEYGEN_URL').replace(/\/$/, '');
  const keygenToken = readEnvValue('KEYGEN_TOKEN');
  if (!keygenUrl || !keygenToken || keygenUrl === 'paste-here' || keygenToken === 'paste-here') {
    throw keygenError('The MindDo key service is not configured.', 'Put the real KEYGEN_URL and KEYGEN_TOKEN values in .env.');
  }

  let response;
  try {
    response = await fetch(`${keygenUrl}/api/lookup-key`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${keygenToken}` }
    });
  } catch {
    throw keygenError('The MindDo key service could not be reached.', 'Check the key service URL and internet connection.');
  }

  let body = {};
  try { body = await response.json(); } catch { /* handled below */ }
  const expiresAt = expiresAtMilliseconds(body.expiresAt);
  if (!response.ok || !body.apiKey || !expiresAt) {
    throw keygenError('The MindDo key service did not return a usable key.', 'Check the MindDo token, lookup URL, and response fields apiKey and expiresAt.');
  }

  cachedKey = body.apiKey;
  cachedExpiresAt = expiresAt;
  return cachedKey;
}

function invalidateKey() {
  cachedKey = null;
  cachedExpiresAt = 0;
}

module.exports = { getKey, invalidateKey };
