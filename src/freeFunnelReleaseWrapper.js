import app from './masteryFeatureWrapper.js';
import { identityClientSource } from './identity.js';
import { handleMilestoneCompletion } from './milestones.js';

const FREE_FUNNEL = {
  '/challenge': {
    key: 'flexStandard.challenge7.v2',
    total: 7,
    eventName: '7_day_foundation_completed',
    unlockFlag: 'flexStandard.momentum14.unlocked',
  },
  '/challenges/7-day': {
    key: 'flexStandard.challenge7.v2',
    total: 7,
    eventName: '7_day_foundation_completed',
    unlockFlag: 'flexStandard.momentum14.unlocked',
  },
  '/challenges/14-day': {
    key: 'flexStandard.challenge14.v3',
    total: 14,
    eventName: '14_day_momentum_completed',
    unlockFlag: 'flexStandard.habit21.unlocked',
  },
  '/challenges/21-day': {
    key: 'flexStandard.challenge21.v2',
    total: 21,
    eventName: '21_day_habit_lock_completed',
    unlockFlag: null,
  },
};

function normalizedPath(url) {
  return new URL(url).pathname.replace(/\/$/, '') || '/';
}

function milestoneClientScript(config) {
  const identitySource = identityClientSource();
  return `<script data-flex-free-funnel-release-gate>
${identitySource}
(function(){
  const KEY=${JSON.stringify(config.key)};
  const TOTAL=${config.total};
  const EVENT=${JSON.stringify(config.eventName)};
  const UNLOCK=${JSON.stringify(config.unlockFlag)};
  const SENT='flexStandard.milestoneSent.'+EVENT;
  function completedCount(){
    try{
      const state=JSON.parse(localStorage.getItem(KEY)||'{}');
      if(!Array.isArray(state.completed))return 0;
      return new Set(state.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL)).size;
    }catch(e){return 0}
  }
  async function syncMilestone(){
    if(completedCount()!==TOTAL)return;
    if(UNLOCK){try{localStorage.setItem(UNLOCK,'true')}catch(e){}}
    try{if(localStorage.getItem(SENT)==='true')return}catch(e){}
    const userId=getOrCreateUserId();
    try{
      const response=await fetch('/api/milestones/complete',{
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({user_id:userId,event_name:EVENT,completed_at:Date.now()})
      });
      if(response.ok){try{localStorage.setItem(SENT,'true')}catch(e){}}
    }catch(e){}
  }
  window.addEventListener('pageshow',syncMilestone);
  document.addEventListener('click',function(event){
    if(event.target.closest('[data-complete],#completeBtn'))setTimeout(syncMilestone,0);
  });
  syncMilestone();
})();
</script>`;
}

export function transformFreeFunnelHtml(source, path) {
  let html = String(source || '');

  if (path === '/challenges/14-day') {
    html = html.replace("const sevenKey='flexStandard.challenge7.v1'", "const sevenKey='flexStandard.challenge7.v2'");
  }

  if (path === '/') {
    html = html
      .replace('Build your foundation—or start where you are.', 'Start with Foundation. Build Momentum. Lock in the Habit.')
      .replace('The free challenges are the recommended FLEX path, not a gate. Choose the level that fits where you are today.', 'Complete the free FLEX path in order: 7-Day Foundation → 14-Day Momentum → 21-Day Habit Lock.')
      .replace('<a href="/challenges/28-day">28-DAY MASTERY</a>', '')
      .replace(/<a class="card path" href="\/challenges\/28-day">[\s\S]*?<\/a><\/div><\/section>/, '</div></section>');
  }

  const config = FREE_FUNNEL[path];
  if (config && !html.includes('data-flex-free-funnel-release-gate')) {
    html = html.replace('</body>', `${milestoneClientScript(config)}</body>`);
  }

  return html;
}

async function transformHtmlResponse(response, path) {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) return response;
  const source = await response.text();
  const transformed = transformFreeFunnelHtml(source, path);
  if (transformed === source) return new Response(source, response);
  const headers = new Headers(response.headers);
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(transformed, { status: response.status, statusText: response.statusText, headers });
}

export default {
  async fetch(request, env, ctx) {
    const path = normalizedPath(request.url);

    if (path === '/api/milestones/complete') {
      return handleMilestoneCompletion(request, env);
    }

    const response = await app.fetch(request, env, ctx);
    if (request.method !== 'GET') return response;

    if (path === '/' || path === '/challenge' || path === '/challenges/7-day' || path === '/challenges/14-day' || path === '/challenges/21-day') {
      return transformHtmlResponse(response, path);
    }

    return response;
  },
};
