export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/hero-banner.png') {
      const asset = await fetch('https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/hero-banner.png');
      if (!asset.ok || !asset.body) return new Response('Hero banner unavailable', { status: 502 });
      return new Response(asset.body, {
        status: 200,
        headers: {
          'content-type': 'image/png',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    if (url.pathname === '/flex-hero-web.mp4') {
      const asset = await fetch('https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/flex-hero-web.mp4');
      if (!asset.ok || !asset.body) return new Response('Hero video unavailable', { status: 502 });
      return new Response(asset.body, {
        status: 200,
        headers: {
          'content-type': 'video/mp4',
          'cache-control': 'public, max-age=86400'
        }
      });
    }

    const isStandardPage = url.pathname === '/standard' || url.pathname === '/standard/';

    const pageContent = isStandardPage
      ? `<section class="standard-hero reveal visible"><div class="badge">THE FLEX STANDARD</div><h1>Focus. Learn. Execute. <span class="gold">eXcel.</span></h1><p class="sub">Four principles. One standard. Build yourself one deliberate action at a time.</p></section>
<section class="section reveal visible" id="standard"><div class="flex-grid"><article class="flex-card"><div class="letter">F</div><h3>Focus</h3><p>Choose what matters. Cut the noise. Set the target.</p></article><article class="flex-card"><div class="letter">L</div><h3>Learn</h3><p>Build knowledge, awareness, and the skills to move forward.</p></article><article class="flex-card"><div class="letter">E</div><h3>Execute</h3><p>Turn intention into action. Do the work when it counts.</p></article><article class="flex-card"><div class="letter">X</div><h3>eXcel</h3><p>Repeat the standard. Improve it. Become who you said you would be.</p></article></div></section>
<section class="cta reveal visible"><h2>Live The Standard.</h2><p style="color:var(--muted);margin-top:.5rem">Know the principles. Put them into practice one day at a time.</p><a href="/">BACK TO HOME</a></section>`
      : `<section class="hero"><div class="hero-banner-container"><img src="/hero-banner.png" alt="The Flex Standard - Become Your Standard, Live the Flex" class="hero-banner-img"></div><div class="hero-video-container"><video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="/hero-banner.png"><source src="/flex-hero-web.mp4" type="video/mp4"></video></div><div class="badge">Free 7-Day Foundation</div><h1>Focus. Learn. Execute. Excel.</h1></section>
<section class="section reveal" id="journey"><h2 class="heading">Your FLEX Journey</h2><p class="sub">Start with seven days. Build momentum. Lock in the habit. Earn the next level.</p><div class="journey" id="journeyTrack"><div class="journey-fill" id="journeyFill"></div><div class="tier"><div class="node"></div><div class="tier-card"><strong>7-Day Foundation</strong><span>Start small. Establish your daily standard.</span></div></div><div class="tier"><div class="node"></div><div class="tier-card"><strong>14-Day Momentum</strong><span>Build on the foundation and keep moving.</span></div></div><div class="tier"><div class="node"></div><div class="tier-card"><strong>21-Day Habit Lock</strong><span>Turn consistent action into a repeatable discipline.</span></div></div><div class="tier lock"><div class="node"></div><div class="tier-card"><strong>28-Day Mastery 🔒</strong><span>Complete the free path to unlock the next level.</span></div></div></div></section>
<section class="cta reveal"><h2>Become Your Standard.</h2><p style="color:var(--muted);margin-top:.5rem">Seven days. One decision each day. Start building the person you want to become.</p><a href="#journey">START THE FREE 7-DAY CHALLENGE</a></section>`;

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>${isStandardPage ? 'The Standard' : 'The Flex Standard'} – Focus. Learn. Execute. Excel.</title><meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
<style>
:root{--bg:#0a0a0a;--card:#141414;--soft:#1a1a1a;--border:#262626;--gold:#d4af37;--gold2:#b8860b;--text:#ededed;--muted:#a1a1a1;--ease:cubic-bezier(.2,.8,.2,1)}
*{box-sizing:border-box;margin:0;padding:0}html{scroll-behavior:smooth}body{background:var(--bg);color:var(--text);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;line-height:1.6;min-height:100vh;overflow-x:hidden}a{color:inherit;text-decoration:none}
.nav{border-bottom:1px solid var(--border);padding:1rem 2rem;display:flex;align-items:center;justify-content:space-between;background:rgba(10,10,10,.82);backdrop-filter:blur(14px);position:sticky;top:0;z-index:100}.brand{font-size:1.25rem;font-weight:800;letter-spacing:.05em;color:var(--gold);transition:filter .25s,transform .25s}.brand:hover{filter:drop-shadow(0 0 8px rgba(212,175,55,.45));transform:translateY(-1px)}.desktop-nav{display:flex;gap:1.4rem;align-items:center}.desktop-nav a{font-size:.88rem;font-weight:700;letter-spacing:.06em;color:var(--muted);transition:color .2s}.desktop-nav a:hover,.desktop-nav a.active{color:var(--gold)}.menu-btn{display:none;background:var(--card);border:1px solid var(--border);color:var(--text);border-radius:10px;padding:.55rem .8rem;font-weight:700}.mobile-menu{display:none;position:fixed;top:70px;right:1rem;left:1rem;background:#111;border:1px solid var(--border);border-radius:14px;padding:.7rem;z-index:99;box-shadow:0 18px 45px rgba(0,0,0,.45)}.mobile-menu.open{display:block}.mobile-menu a{display:block;padding:.9rem 1rem;border-radius:10px;font-weight:700}.mobile-menu a:hover,.mobile-menu a.active{background:var(--card);color:var(--gold)}
main{max-width:1200px;margin:0 auto;padding:2rem 1rem;width:100%}.hero{text-align:center;margin-bottom:4.5rem}.hero-banner-container{width:100%;margin-bottom:1.5rem;display:flex;justify-content:center;overflow:hidden;border-radius:12px;border:1px solid var(--border);background:#0b0806}.hero-banner-img{width:100%;max-width:1100px;height:auto;display:block}.hero-video-container{position:relative;width:100%;max-width:1100px;margin:0 auto 2rem;overflow:hidden;border-radius:18px;border:1px solid rgba(212,175,55,.30);background:#000;box-shadow:0 18px 55px rgba(0,0,0,.42),0 0 30px rgba(212,175,55,.05)}.hero-video{width:100%;height:min(72vh,680px);display:block;object-fit:cover;object-position:center;background:#000}.badge{display:inline-block;padding:.25rem .75rem;background:var(--soft);border:1px solid var(--border);color:var(--gold);border-radius:999px;font-size:.875rem;font-weight:600;margin-bottom:1rem;text-transform:uppercase;letter-spacing:.05em}h1{font-size:clamp(2rem,6vw,3.2rem);font-weight:800;margin-bottom:1rem;letter-spacing:-.02em}.gold{color:var(--gold)}.standard-hero{text-align:center;padding:4rem 0 2.5rem}
.section{margin-bottom:5rem;position:relative}.heading{font-size:clamp(1.7rem,5vw,2.4rem);color:var(--gold);margin-bottom:1rem;text-align:center}.sub{text-align:center;color:var(--muted);max-width:680px;margin:0 auto 2rem}.reveal{opacity:0;transform:translateY(28px);transition:opacity .75s var(--ease),transform .75s var(--ease)}.reveal.visible{opacity:1;transform:none}
.flex-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1rem}.flex-card{background:linear-gradient(145deg,var(--card),#101010);border:1px solid var(--border);border-radius:16px;padding:1.6rem;position:relative;overflow:hidden;transition:transform .3s var(--ease),border-color .3s,box-shadow .3s}.flex-card:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(212,175,55,.10),transparent 48%);opacity:0;transition:opacity .3s}.flex-card:hover{transform:translateY(-5px);border-color:rgba(212,175,55,.55);box-shadow:0 14px 35px rgba(0,0,0,.32)}.flex-card:hover:before{opacity:1}.letter{font-size:2.3rem;font-weight:900;color:var(--gold);line-height:1}.flex-card h3{margin:.45rem 0}.flex-card p{color:var(--muted);font-size:.94rem}
.journey{max-width:820px;margin:0 auto;position:relative}.journey:before{content:'';position:absolute;left:25px;top:28px;bottom:28px;width:2px;background:var(--border)}.journey-fill{position:absolute;left:25px;top:28px;width:2px;height:0;background:linear-gradient(var(--gold),var(--gold2));box-shadow:0 0 10px rgba(212,175,55,.6);transition:height .15s linear}.tier{display:grid;grid-template-columns:52px 1fr;gap:1rem;align-items:center;margin:1rem 0;position:relative}.node{width:18px;height:18px;border-radius:50%;border:2px solid var(--border);background:var(--bg);margin:auto;z-index:2;transition:.35s}.tier.active .node{border-color:var(--gold);background:var(--gold);box-shadow:0 0 16px rgba(212,175,55,.55)}.tier-card{padding:1.2rem 1.4rem;background:var(--card);border:1px solid var(--border);border-radius:14px;transition:.35s}.tier.active .tier-card{border-color:rgba(212,175,55,.45);transform:translateX(4px)}.tier-card strong{color:var(--gold)}.tier-card span{color:var(--muted);display:block;font-size:.9rem}.lock{opacity:.58}
.cta{text-align:center;margin:5rem 0 2rem;padding:3rem 1.5rem;border:1px solid var(--border);border-radius:18px;background:radial-gradient(circle at 50% 0%,rgba(212,175,55,.12),transparent 55%),var(--card)}.cta a{display:inline-block;margin-top:1.3rem;background:var(--gold);color:#080808;padding:.85rem 1.35rem;border-radius:999px;font-weight:800;transition:transform .25s,box-shadow .25s}.cta a:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 10px 30px rgba(212,175,55,.22)}footer{border-top:1px solid var(--border);padding:2rem;text-align:center;color:var(--muted);font-size:.875rem}
@media(max-width:760px){.nav{padding:.9rem 1rem}.desktop-nav{display:none}.menu-btn{display:block}.flex-grid{grid-template-columns:1fr 1fr}.hero{margin-bottom:3.5rem}.section{margin-bottom:4rem}.hero-video{height:72vh;max-height:620px}}@media(max-width:480px){.flex-grid{grid-template-columns:1fr}.flex-card:hover{transform:none}.hero-video-container{border-radius:14px}.hero-video{height:68vh;max-height:560px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*,*:before,*:after{animation:none!important;transition:none!important}.reveal{opacity:1;transform:none}}
</style></head><body>
<header><div class="nav"><a href="/" class="brand">THE FLEX STANDARD</a><nav class="desktop-nav" aria-label="Primary"><a href="/" class="${isStandardPage ? '' : 'active'}">HOME</a><a href="/standard" class="${isStandardPage ? 'active' : ''}">THE STANDARD</a></nav><button class="menu-btn" id="menuBtn" aria-expanded="false" aria-controls="mobileMenu">☰ MENU</button></div><nav class="mobile-menu" id="mobileMenu" aria-label="Mobile"><a href="/" class="${isStandardPage ? '' : 'active'}">HOME</a><a href="/standard" class="${isStandardPage ? 'active' : ''}">THE STANDARD</a></nav></header><main>
${pageContent}
</main><footer><p>&copy; 2026 The Flex Standard. All rights reserved.</p></footer>
<script>
const menuBtn=document.getElementById('menuBtn'),mobileMenu=document.getElementById('mobileMenu');if(menuBtn&&mobileMenu){menuBtn.addEventListener('click',()=>{const open=mobileMenu.classList.toggle('open');menuBtn.setAttribute('aria-expanded',String(open))})}
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;if(!reduced){const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));const track=document.getElementById('journeyTrack'),fill=document.getElementById('journeyFill'),tiers=[...document.querySelectorAll('.tier')];if(track&&fill){function updateJourney(){const r=track.getBoundingClientRect(),vh=innerHeight;const p=Math.max(0,Math.min(1,(vh*.72-r.top)/(r.height*.82)));fill.style.height=(p*(r.height-56))+'px';tiers.forEach((t,i)=>t.classList.toggle('active',p>i/(tiers.length-.25)))}addEventListener('scroll',updateJourney,{passive:true});updateJourney()}}else{document.querySelectorAll('.reveal').forEach(el=>el.classList.add('visible'));document.querySelectorAll('.tier').forEach(el=>el.classList.add('active'))}
</script></body></html>`;

    return new Response(html, {
      status: 200,
      headers: {
        'content-type': 'text/html; charset=utf-8'
      }
    });
  }
};
