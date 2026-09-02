export const FLEX_USER_ID_KEY = 'flexStandard.userId.v1';

function fallbackId() {
  const random = Math.random().toString(36).slice(2, 12);
  return `anon_${Date.now().toString(36)}_${random}`;
}

export function getOrCreateUserId(storage = globalThis?.localStorage, cryptoApi = globalThis?.crypto) {
  try {
    const existing = String(storage?.getItem?.(FLEX_USER_ID_KEY) || '').trim();
    if (existing) return existing.slice(0, 128);
  } catch {}

  let id = '';
  try {
    if (typeof cryptoApi?.randomUUID === 'function') id = cryptoApi.randomUUID();
  } catch {}
  if (!id) id = fallbackId();

  try { storage?.setItem?.(FLEX_USER_ID_KEY, id); } catch {}
  return id.slice(0, 128);
}

export function identityClientSource() {
  return `
const FLEX_USER_ID_KEY='${FLEX_USER_ID_KEY}';
function getOrCreateUserId(){
  try{const existing=String(localStorage.getItem(FLEX_USER_ID_KEY)||'').trim();if(existing)return existing.slice(0,128)}catch(e){}
  let id='';
  try{if(globalThis.crypto&&typeof globalThis.crypto.randomUUID==='function')id=globalThis.crypto.randomUUID()}catch(e){}
  if(!id)id='anon_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,12);
  try{localStorage.setItem(FLEX_USER_ID_KEY,id)}catch(e){}
  return id.slice(0,128);
}`.trim();
}
