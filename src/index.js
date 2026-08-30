const CHALLENGES = {
  7: {
    slug: '7-day',
    name: '7-Day Foundation',
    eyebrow: 'FREE 7-DAY FOUNDATION',
    intro: 'Start small. One deliberate action each day. Build proof that you can show up and return.',
    key: 'flexStandard.challenge7.v2',
    next: 14,
    days: [
      ['FOCUS','Pick One Thing','Choose one area you want to improve this week. Make it simple and specific.'],
      ['FOCUS','Remove One Distraction','Reduce one distraction that steals your attention today.'],
      ['LEARN','Learn for 10 Minutes','Spend 10 focused minutes learning something connected to your goal.'],
      ['LEARN','Apply One Lesson','Use one thing you learned yesterday in real life today.'],
      ['EXECUTE','Do the Thing','Take one meaningful action you have been putting off. Small counts.'],
      ['EXECUTE','Show Up Again','Repeat one positive action even if motivation is low.'],
      ['EXCEL','Set Your Standard','Choose one action from this week that you will continue.']
    ]
  },
  14: {
    slug: '14-day',
    name: '14-Day Momentum',
    eyebrow: 'FREE 14-DAY MOMENTUM',
    intro: 'Add movement, preparation, recovery, and structure without making life complicated.',
    key: 'flexStandard.challenge14.v2',
    requires: 7,
    next: 21,
    days: [
      ['FOCUS','Choose Your Momentum Goal','Pick one practical goal for the next two weeks and write it down.'],
      ['MOVE','10-Minute Walk','Walk for 10 minutes at a comfortable pace.'],
      ['PREP','Prepare Tomorrow Tonight','Set out what you need for tomorrow before bed.'],
      ['MOVE','Simple Strength','Do 2 rounds: 8 chair squats, 8 wall or incline push-ups, and 20 seconds of marching. Scale as needed.'],
      ['LEARN','Learn One Better Way','Spend 10 minutes learning something that supports your goal.'],
      ['RECOVER','Recovery Day','Take an easy walk or stretch for 10 minutes and prioritize hydration and sleep.'],
      ['REFLECT','Week-One Check','Write one win, one obstacle, and one adjustment for next week.'],
      ['FOCUS','Reset the Target','Choose the single most important action for this week.'],
      ['MOVE','15-Minute Walk','Walk for 15 minutes at a comfortable pace.'],
      ['PREP','Remove Friction','Make one good habit easier: prep a meal, fill a water bottle, clear a workspace, or set out workout gear.'],
      ['MOVE','Strength + Mobility','Do 2 rounds: 10 squats, 8 incline push-ups, 10 hip hinges, then 3 minutes of easy mobility.'],
      ['EXECUTE','Finish One Delayed Task','Complete one useful task you have been avoiding.'],
      ['RECOVER','Active Recovery','Choose 10–15 minutes of easy movement, stretching, or mobility.'],
      ['EXCEL','Lock in Momentum','Choose two actions from these 14 days that become part of your normal week.']
    ]
  },
  21: {
    slug: '21-day',
    name: '21-Day Habit Lock',
    eyebrow: 'FREE 21-DAY HABIT LOCK',
    intro: 'Practice consistency under real-life conditions and build a standard you can keep after the challenge ends.',
    key: 'flexStandard.challenge21.v2',
    requires: 14,
    days: [
      ['FOCUS','Define the Standard','Write the three actions that matter most for the next 21 days.'],
      ['MOVE','20-Minute Walk','Walk for 20 minutes. Break it into smaller blocks if needed.'],
      ['STRENGTH','Full-Body A','Do 2–3 rounds: 10 squats, 8 incline push-ups, 10 hip hinges, 10 rows per side if equipment is available.'],
      ['PREP','Build Tomorrow','Prepare one meal, one outfit, and your top task for tomorrow.'],
      ['FOCUS','Protect 20 Minutes','Block 20 distraction-free minutes for the goal that matters most.'],
      ['MOVE','Mobility + Steps','Do 10 minutes of mobility and add purposeful walking to your day.'],
      ['REFLECT','Week-One Review','Name one win, one miss, and exactly how you will return tomorrow.'],
      ['STRENGTH','Full-Body B','Do 2–3 rounds: 8 split squats per side, 10 presses or incline push-ups, 10 glute bridges, 20-second plank.'],
      ['LEARN','Learn and Apply','Learn for 10 minutes, then use one idea before the day ends.'],
      ['MOVE','Brisk 20 Minutes','Walk briskly for 20 minutes or use another moderate movement you can sustain.'],
      ['EXECUTE','Do the Hard Thing First','Finish your most important reasonable task before lower-value distractions.'],
      ['RECOVER','Recovery with Intention','Use 15 minutes for easy movement or stretching and protect your sleep routine.'],
      ['STRENGTH','Full-Body A Plus','Repeat Full-Body A and add one or two reps per movement if comfortable.'],
      ['REFLECT','Two-Week Audit','Identify what is working, what is too hard, and what should be simplified.'],
      ['FOCUS','One Non-Negotiable','Choose one action that must happen today, even on a busy day.'],
      ['MOVE','25-Minute Walk','Walk for 25 minutes, continuously or in shorter blocks.'],
      ['STRENGTH','Full-Body B Plus','Repeat Full-Body B and add one small progression if comfortable.'],
      ['PREP','Design Your Environment','Remove one obstacle and place one helpful cue where you will see it.'],
      ['EXECUTE','Return Fast','If anything slipped this week, restart that action today without punishment or catch-up.'],
      ['MOVE','Choose Your Movement','Pick 20–30 minutes of walking, strength, mobility, or a mix you can repeat next week.'],
      ['EXCEL','Habit Lock','Choose your weekly movement plan, one focus habit, and one reset rule for the next 30 days.']
    ]
  }
};

const CHALLENGE_KEYS={7:'flexStandard.challenge7.v2',14:'flexStandard.challenge14.v2',21:'flexStandard.challenge21.v2'};

const css = `
:root{--bg:#08090b;--card:#151619;--line:rgba(255,255,255,.09);--gold:#d4af37;--gold2:#f0d36a;--text:#f4f4f4;--muted:#aaa}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:radial-gradient(circle at 50% -10%,#1b1b1f,#0c0d10 42%,var(--bg) 72%);color:var(--text);font-family:Inter,system-ui,-apple-system,'Segoe UI',sans-serif;line-height:1.6;min-height:100vh}a{color:inherit;text-decoration:none}button{font:inherit}.nav{position:sticky;top:0;z-index:50;display:flex;justify-content:space-between;align-items:center;padding:.9rem clamp(1rem,4vw,2rem);background:rgba(8,9,11,.9);backdrop-filter:blur(18px);border-bottom:1px solid var(--line)}.brand{color:var(--gold);font-weight:950;letter-spacing:.08em}.desktop{display:flex;gap:1.2rem;align-items:center}.desktop a{color:var(--muted);font-size:.82rem;font-weight:850}.desktop a:hover{color:var(--gold)}.menu-btn{display:none;background:#151619;color:#fff;border:1px solid var(--line);border-radius:10px;padding:.55rem .75rem;font-weight:900}.mobile-menu{display:none;position:fixed;z-index:49;top:68px;left:1rem;right:1rem;background:#111216;border:1px solid var(--line);border-radius:16px;padding:.6rem;box-shadow:0 24px 60px #000}.mobile-menu.open{display:block}.mobile-menu a{display:block;padding:.9rem 1rem;font-weight:850}main{width:min(1160px,calc(100% - 2rem));margin:auto}.hero{padding:clamp(2rem,6vw,4.5rem) 0 2rem;text-align:center}.hero-banner{max-width:1040px;margin:0 auto 1.4rem;border:1px solid rgba(212,175,55,.26);border-radius:24px;overflow:hidden;background:#080808}.hero-banner img{display:block;width:100%;height:auto}.eyebrow{display:inline-block;color:var(--gold);border:1px solid rgba(212,175,55,.36);background:rgba(212,175,55,.07);border-radius:999px;padding:.38rem .72rem;font-size:.7rem;font-weight:950;letter-spacing:.13em}.hero h1,.challenge-hero h1{font-size:clamp(2.5rem,8vw,5rem);line-height:.98;letter-spacing:-.04em;margin:1rem auto;max-width:950px}.gold{color:var(--gold)}.lead{color:#c5c5c5;font-size:clamp(1rem,2vw,1.18rem);max-width:760px;margin:0 auto}.actions{display:flex;gap:.8rem;justify-content:center;flex-wrap:wrap;margin-top:1.4rem}.primary,.secondary{display:inline-flex;justify-content:center;align-items:center;border-radius:999px;padding:.9rem 1.15rem;font-weight:950}.primary{background:linear-gradient(135deg,var(--gold2),var(--gold));color:#080808}.secondary{border:1px solid var(--line);background:rgba(255,255,255,.03)}.hero-media{margin:2rem auto 0;max-width:1000px;border:1px solid rgba(212,175,55,.28);border-radius:26px;overflow:hidden;background:#000;position:relative}.hero-media video{width:100%;height:min(68vh,650px);display:block;object-fit:cover}.sound{position:absolute;right:14px;bottom:14px;border:1px solid rgba(212,175,55,.55);background:rgba(8,8,8,.84);color:#fff;border-radius:999px;padding:.7rem .9rem;font-weight:900}.section{padding:1.5rem 0 4.5rem}.section-head{text-align:center;margin-bottom:1.6rem}.section-head h2{font-size:clamp(1.8rem,5vw,3rem);margin:.4rem 0}.section-head p{color:var(--muted);max-width:720px;margin:auto}.grid4,.grid3{display:grid;gap:1rem}.grid4{grid-template-columns:repeat(4,1fr)}.grid3{grid-template-columns:repeat(3,1fr)}.card{border:1px solid var(--line);border-radius:20px;padding:1.35rem;background:linear-gradient(180deg,rgba(28,29,32,.84),rgba(15,16,18,.9))}.card h3{margin:.65rem 0 .25rem}.card p{color:var(--muted);margin:.2rem 0}.path{position:relative;overflow:hidden}.path:before{content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--gold)}.path small{color:var(--gold);font-weight:950;letter-spacing:.08em}.locked{opacity:.55}.challenge-hero{text-align:center;padding:3.5rem 0 1.5rem}.progress{max-width:760px;margin:1.5rem auto;padding:1.15rem;border:1px solid var(--line);border-radius:20px;background:var(--card)}.progress-top{display:grid;grid-template-columns:86px 1fr;gap:1rem;align-items:center;text-align:left}.ring{--p:0;width:78px;height:78px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(var(--gold) calc(var(--p)*1%),#292a2d 0);position:relative}.ring:before{content:'';position:absolute;width:60px;height:60px;border-radius:50%;background:#111216}.ring span{z-index:1;color:var(--gold);font-weight:950}.track{height:9px;background:#292a2d;border-radius:999px;overflow:hidden;margin-top:.55rem}.bar{height:100%;width:0;background:linear-gradient(90deg,var(--gold),var(--gold2));transition:width .35s}.challenge-layout{display:grid;grid-template-columns:270px 1fr;gap:1.4rem;padding:1rem 0 4rem}.aside{position:sticky;top:90px;align-self:start}.days{display:grid;gap:.9rem}.day{border:1px solid var(--line);border-radius:18px;padding:1.15rem 1.2rem;background:var(--card)}.day.current{border-color:rgba(212,175,55,.65)}.day.done{border-color:rgba(212,175,55,.35)}.day.locked{opacity:.45}.day-top{display:flex;justify-content:space-between;gap:1rem}.day-no,.stage{color:var(--gold);font-size:.7rem;font-weight:950;letter-spacing:.1em}.state{margin-top:.6rem;color:#888;font-size:.72rem;font-weight:900}.complete{width:100%;margin-top:.8rem;border:0;border-radius:14px;padding:.85rem;background:linear-gradient(135deg,var(--gold2),var(--gold));color:#080808;font-weight:950;cursor:pointer}.complete:disabled{background:#292a2d;color:#777}.completion{max-width:760px;margin:0 auto 4rem;text-align:center;padding:2rem;border:1px solid rgba(212,175,55,.4);border-radius:24px;background:#111216}.seal{width:76px;height:76px;margin:0 auto 1rem;border-radius:50%;display:grid;place-items:center;background:var(--gold);color:#080808;font-size:2rem;font-weight:950}.notice{max-width:760px;margin:1.5rem auto;padding:1.15rem;border:1px solid rgba(212,175,55,.35);border-radius:18px;background:rgba(212,175,55,.06);text-align:center}.letter{width:44px;height:44px;display:grid;place-items:center;border-radius:12px;background:rgba(212,175,55,.11);color:var(--gold);font-size:1.5rem;font-weight:950}footer{text-align:center;color:#777;border-top:1px solid var(--line);padding:2rem 1rem;font-size:.82rem}
@media(max-width:860px){.grid4{grid-template-columns:1fr 1fr}.grid3{grid-template-columns:1fr}.challenge-layout{grid-template-columns:1fr}.aside{position:static}}
@media(max-width:720px){.desktop{display:none}.menu-btn{display:block}.hero-media video{height:58vh}.hero-banner{border-radius:16px}}
@media(max-width:500px){.grid4{grid-template-columns:1fr}.progress-top{grid-template-columns:70px 1fr}.ring{width:66px;height:66px}.ring:before{width:50px;height:50px}.actions{flex-direction:column}.primary,.secondary{width:100%}}
`;

function shell(title, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive,nosnippet"><title>${title} – The Flex Standard</title><style>${css}</style></head><body><header class="nav"><a class="brand" href="/">THE FLEX STANDARD</a><nav class="desktop"><a href="/">HOME</a><a href="/standard">THE STANDARD</a><a href="/challenges">CHALLENGES</a><a href="/start-here">START HERE</a><a href="/inner-circle">INNER CIRCLE</a><a href="/merch">MERCH</a></nav><button class="menu-btn" id="menuBtn" type="button">☰ MENU</button></header><nav class="mobile-menu" id="mobileMenu"><a href="/">HOME</a><a href="/standard">THE STANDARD</a><a href="/challenges">CHALLENGES</a><a href="/challenges/7-day">7-DAY FOUNDATION</a><a href="/challenges/14-day">14-DAY MOMENTUM</a><a href="/challenges/21-day">21-DAY HABIT LOCK</a></nav><main>${body}</main><footer>© 2026 The Flex Standard. All rights reserved.</footer><script>const m=document.getElementById('menuBtn'),n=document.getElementById('mobileMenu');if(m&&n)m.onclick=()=>n.classList.toggle('open')</script></body></html>`;
}

function home() {
  return `<section class="hero"><div class="hero-banner"><img src="/hero-banner.png" alt="The Flex Standard black and gold Flex hero artwork"></div><span class="eyebrow">THE FLEX STANDARD · BUILT FOR REAL LIFE</span><h1>BUILD <span class="gold">UNBREAKABLE</span> CONSISTENCY.</h1><p class="lead">Small daily standards. Real-life progress. Build habits that last without perfection, guilt, or starting over every time life gets busy.</p><div class="actions"><a class="primary" href="/challenges/7-day">START THE FREE 7-DAY CHALLENGE →</a></div><div class="hero-media"><video id="heroVideo" autoplay muted loop playsinline preload="metadata"><source src="/hero-video-20260824.mp4" type="video/mp4"></video><button class="sound" id="soundBtn" type="button">🔊 Tap for Sound</button></div></section>${pathCards()}<section class="completion"><span class="eyebrow">YOUR FIRST COMMITMENT</span><h2>Ready to build the Foundation?</h2><p class="lead">Seven days. One decision each day. Start small, take action, and build consistency.</p><div class="actions"><a class="primary" href="/challenges/7-day">START THE FREE 7-DAY CHALLENGE</a></div></section><script>const v=document.getElementById('heroVideo'),b=document.getElementById('soundBtn');if(v&&b)b.onclick=async()=>{v.muted=!v.muted;b.textContent=v.muted?'🔊 Tap for Sound':'🔇 Mute';if(!v.muted)try{await v.play()}catch(e){}}</script>`;
}

function pathCards() {
  return `<section class="section"><div class="section-head"><span class="eyebrow">YOUR FREE PATH</span><h2>Start small. Build momentum. Lock it in.</h2><p>Three complete free challenges. The 28-Day Mastery tier remains locked for later.</p></div><div class="grid4"><a class="card path" href="/challenges/7-day"><small>01 · FOUNDATION</small><h3>7-Day Foundation</h3><p>Start with simple deliberate action.</p></a><a class="card path" href="/challenges/14-day"><small>02 · MOMENTUM</small><h3>14-Day Momentum</h3><p>Add movement, preparation, recovery, and structure.</p></a><a class="card path" href="/challenges/21-day"><small>03 · HABIT LOCK</small><h3>21-Day Habit Lock</h3><p>Practice consistency and returning after imperfect days.</p></a><article class="card path locked"><small>04 · LOCKED</small><h3>28-Day Mastery</h3><p>Premium tier. Not available yet.</p></article></div></section>`;
}

function standard() {
  return `<section class="challenge-hero"><span class="eyebrow">THE FLEX STANDARD</span><h1>FOCUS. LEARN. EXECUTE. <span class="gold">eXCEL.</span></h1><p class="lead">Four principles. One standard. Build yourself one deliberate action at a time.</p></section><section class="section"><div class="grid4"><article class="card"><div class="letter">F</div><h3>Focus</h3><p>Choose what matters. Cut the noise. Set the target.</p></article><article class="card"><div class="letter">L</div><h3>Learn</h3><p>Build knowledge, awareness, and useful skills.</p></article><article class="card"><div class="letter">E</div><h3>Execute</h3><p>Turn intention into action. Do the work when it counts.</p></article><article class="card"><div class="letter">X</div><h3>eXcel</h3><p>Repeat what works and keep raising your standard.</p></article></div></section>`;
}

function challengePage(days) {
  const c = CHALLENGES[days];
  const cards = c.days.map((d,i)=>`<article class="day" data-day="${i+1}"><div class="day-top"><span class="day-no">DAY ${i+1}</span><span class="stage">${d[0]}</span></div><h3>${d[1]}</h3><p>${d[2]}</p><div class="state"></div><button class="complete" data-complete="${i+1}" type="button">COMPLETE DAY ${i+1}</button></article>`).join('');
  const req = c.requires || 0;
  const next = c.next ? `<a class="primary" href="/challenges/${c.next}-day">GO TO ${c.next}-DAY CHALLENGE →</a>` : `<a class="primary" href="/challenges">FREE PATH COMPLETE →</a>`;
  return `<section class="challenge-hero"><span class="eyebrow">${c.eyebrow}</span><h1>${c.name.toUpperCase()}</h1><p class="lead">${c.intro}</p><div class="progress"><div class="progress-top"><div class="ring" id="ring"><span id="ringText">0%</span></div><div><strong id="progressLabel">Day 1 of ${days}</strong><div id="progressPercent" style="color:var(--muted)">0% complete</div><div class="track"><div class="bar" id="bar"></div></div></div></div></div><div class="notice" id="gateNotice" hidden>Complete the ${req}-Day challenge first to unlock this challenge.</div></section><section class="challenge-layout"><aside class="card aside"><span class="eyebrow">FLEX RULE</span><h2>Return. Do not restart.</h2><p>Missed days do not erase progress. Continue with the next unfinished day. Scale movement to your current ability and stop if something feels wrong.</p><a class="secondary" href="/challenges">VIEW CHALLENGE PATH</a></aside><div class="days" id="days">${cards}</div></section><section class="completion" id="completionPanel" hidden><div class="seal">✓</div><span class="eyebrow">CHALLENGE COMPLETE</span><h2>${c.name} Complete</h2><p>You finished every day and earned the next step.</p><div class="actions">${next}</div></section><script>
const TOTAL=${days},KEY='${c.key}',REQ=${req},REQKEY=REQ?CHALLENGE_KEYS[REQ]:null;
function read(k){try{return JSON.parse(localStorage.getItem(k)||'{}')}catch(e){return {}}}
const gate=REQ?((read(REQKEY).completed||[]).length>=REQ):true;
let s=read(KEY);if(!Array.isArray(s.completed))s.completed=[];s.completed=s.completed.filter(n=>Number.isInteger(n)&&n>=1&&n<=TOTAL);
function render(){s.completed=[...new Set(s.completed)].sort((a,b)=>a-b);const count=s.completed.length,next=Math.min(TOTAL,count+1),pct=Math.round(count/TOTAL*100);document.querySelectorAll('.day').forEach(x=>{const d=Number(x.dataset.day),done=s.completed.includes(d),locked=!gate||(!done&&d>next),current=gate&&!done&&d===next;x.classList.toggle('done',done);x.classList.toggle('locked',locked);x.classList.toggle('current',current);const st=x.querySelector('.state'),bt=x.querySelector('.complete');if(done){st.textContent='✓ COMPLETE';bt.textContent='COMPLETED';bt.disabled=true}else if(!gate){st.textContent='PREVIOUS CHALLENGE REQUIRED';bt.textContent='LOCKED';bt.disabled=true}else if(locked){st.textContent='COMPLETE THE PREVIOUS DAY TO UNLOCK';bt.textContent='LOCKED';bt.disabled=true}else{st.textContent='READY';bt.textContent='COMPLETE DAY '+d;bt.disabled=false}});bar.style.width=pct+'%';ring.style.setProperty('--p',pct);ringText.textContent=pct+'%';progressPercent.textContent=pct+'% complete';progressLabel.textContent=count===TOTAL?TOTAL+' of '+TOTAL+' complete':'Day '+next+' of '+TOTAL;completionPanel.hidden=count!==TOTAL;gateNotice.hidden=gate}
days.onclick=e=>{const bt=e.target.closest('[data-complete]');if(!bt||bt.disabled||!gate)return;const d=Number(bt.dataset.complete),allowed=Math.min(TOTAL,s.completed.length+1);if(d!==allowed)return;s.completed.push(d);localStorage.setItem(KEY,JSON.stringify(s));if(navigator.vibrate)navigator.vibrate(35);render();if(d===TOTAL)setTimeout(()=>completionPanel.scrollIntoView({behavior:'smooth',block:'center'}),300)};render();
</script>`;
}

export default {
  async fetch(request) {
    const u = new URL(request.url);
    if (u.pathname === '/hero-banner.png') {
      const a = await fetch('https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/hero-banner.png');
      if (!a.ok || !a.body) return new Response('Hero banner unavailable', {status:502});
      return new Response(a.body,{status:200,headers:{'content-type':'image/png','cache-control':'public,max-age=86400'}});
    }
    if (u.pathname === '/hero-video-20260824.mp4') {
      const a = await fetch('https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/60463975_1787551879977651.mp4');
      if (!a.ok || !a.body) return new Response('Hero video unavailable',{status:502});
      return new Response(a.body,{status:200,headers:{'content-type':'video/mp4','cache-control':'no-store'}});
    }
    const p=u.pathname.replace(/\/$/,'')||'/';
    if(p==='/standard')return new Response(shell('The Standard',standard()),{headers:{'content-type':'text/html;charset=UTF-8'}});
    if(p==='/challenges')return new Response(shell('Challenges',pathCards()),{headers:{'content-type':'text/html;charset=UTF-8'}});
    if(p==='/challenge'||p==='/challenges/7-day')return new Response(shell('7-Day Foundation',challengePage(7)),{headers:{'content-type':'text/html;charset=UTF-8'}});
    if(p==='/challenges/14-day')return new Response(shell('14-Day Momentum',challengePage(14)),{headers:{'content-type':'text/html;charset=UTF-8'}});
    if(p==='/challenges/21-day')return new Response(shell('21-Day Habit Lock',challengePage(21)),{headers:{'content-type':'text/html;charset=UTF-8'}});
    return new Response(shell('The Flex Standard',home()),{headers:{'content-type':'text/html;charset=UTF-8'}});
  }
};