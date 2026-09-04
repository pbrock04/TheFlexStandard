const BREVO_API = 'https://api.brevo.com/v3';

function cleanString(value, max = 254) {
  return String(value || '').trim().slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function normalizeCheckinTime(value) {
  const time = cleanString(value, 5);
  return ['09:00', '13:00', '18:00'].includes(time) ? time : null;
}

export function normalizeBrevoContact(input = {}) {
  const email = cleanString(input.email).toLowerCase();
  if (!validEmail(email)) throw new Error('A valid email address is required.');

  const attributes = {
    CHALLENGE_DAY: Number.isInteger(Number(input.challenge_day)) ? Math.max(1, Math.min(21, Number(input.challenge_day))) : 1,
    CHALLENGE_STATUS: cleanString(input.challenge_status || 'Active', 32) || 'Active',
  };

  const firstName = cleanString(input.name, 100);
  if (firstName) attributes.FIRSTNAME = firstName;

  const timezone = cleanString(input.timezone, 64);
  if (timezone) attributes.TIMEZONE = timezone;

  const checkinTime = normalizeCheckinTime(input.checkin_time);
  if (checkinTime) attributes.CHECKIN_TIME = checkinTime;

  return { email, attributes };
}

export async function syncBrevoContact(env, input, fetchImpl = fetch) {
  if (!env?.BREVO_API_KEY) return { ok: false, skipped: true, reason: 'BREVO_API_KEY is not configured.' };

  const contact = normalizeBrevoContact(input);
  const listId = Number(env.BREVO_LIST_FOUNDATION);
  const payload = {
    email: contact.email,
    attributes: contact.attributes,
    updateEnabled: true,
  };
  if (Number.isInteger(listId) && listId > 0) payload.listIds = [listId];

  const response = await fetchImpl(`${BREVO_API}/contacts`, {
    method: 'POST',
    headers: {
      'api-key': env.BREVO_API_KEY,
      'content-type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (response.ok) return { ok: true, status: response.status };

  let detail = '';
  try {
    const data = await response.json();
    detail = cleanString(data?.message || data?.code, 240);
  } catch {}

  const error = new Error(detail || `Brevo contact sync failed with status ${response.status}.`);
  error.status = response.status;
  throw error;
}
