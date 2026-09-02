function milestoneScript({ key, total, eventName, unlockFlag = '' }) {
  return `<script id="flex-milestone-sync">
(()=>{
  const KEY=${JSON.stringify(key)},TOTAL=${Number(total)},EVENT=${JSON.stringify(eventName)},UNLOCK=${JSON.stringify(unlockFlag)};
  function userId(){
    try{
      const known=(localStorage.getItem('flex_user_id')||'').trim();
      if(known)return known;
      const existing=(localStorage.getItem('flex_anon_id')||'').trim();
      if(existing)return existing;
      const id='anon_'+(globalThis.crypto&&crypto.randomUUID?crypto.randomUUID():(Math.random().toString(36).slice(2)+Date.now().toString(36)));
      localStorage.setItem('flex_anon_id',id);
      return id;
    }catch{return 'anon_fallback_'+Date.now()}
  }
  function complete(){
    try{
      const state=JSON.parse(localStorage.getItem(KEY)||'{}');
      return Array.isArray(state.completed)&&new Set(state.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL)).size===TOTAL;
    }catch{return false}
  }
  function sync(){
    if(!complete())return;
    if(UNLOCK)localStorage.setItem(UNLOCK,'true');
    fetch('/api/milestones/complete',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({user_id:userId(),event_name:EVENT})}).catch(()=>{});
  }
  sync();
  document.addEventListener('click',e=>{
    if(e.target.closest('[data-complete],#completeBtn'))setTimeout(sync,0);
  });
})();
</script>`;
}

function appendBeforeBody(source, script) {
  if (source.includes('id="flex-milestone-sync"')) return source;
  return source.includes('</body>') ? source.replace('</body>', `${script}</body>`) : source + script;
}

export function enhanceSevenDayProgression(source) {
  return appendBeforeBody(source, milestoneScript({
    key: 'flexStandard.challenge7.v2',
    total: 7,
    eventName: '7_day_foundation_completed',
    unlockFlag: 'flexStandard.momentum14.unlocked',
  }));
}

export function enhanceFourteenDayProgression(source) {
  const legacyGate = "const sevenKey='flexStandard.challenge7.v1';let sevenComplete=false;try{const s=JSON.parse(localStorage.getItem(sevenKey)||'{}');sevenComplete=Array.isArray(s.completed)&&new Set(s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=7)).size===7}catch(e){}if(localStorage.getItem('flexStandard.momentum14.unlocked')==='true')sevenComplete=true;";
  const currentGate = "const foundationKeys=['flexStandard.challenge7.v2','flexStandard.challenge7.v1'];let sevenComplete=localStorage.getItem('flexStandard.momentum14.unlocked')==='true';if(!sevenComplete){for(const key of foundationKeys){try{const s=JSON.parse(localStorage.getItem(key)||'{}');if(Array.isArray(s.completed)&&new Set(s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=7)).size===7){sevenComplete=true;break}}catch(e){}}}";
  const gated = source.includes(legacyGate) ? source.replace(legacyGate, currentGate) : source;
  return appendBeforeBody(gated, milestoneScript({
    key: 'flexStandard.challenge14.v3',
    total: 14,
    eventName: '14_day_momentum_completed',
    unlockFlag: 'flexStandard.habit21.unlocked',
  }));
}

export function enhanceTwentyOneDayProgression(source) {
  return appendBeforeBody(source, milestoneScript({
    key: 'flexStandard.challenge21.v2',
    total: 21,
    eventName: '21_day_habit_lock_completed',
  }));
}
