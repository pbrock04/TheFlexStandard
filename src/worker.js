import app from './index.js';
import { challenge14Page } from './challenge14.js';
import { challenge21Page } from './challenge21.js';
import { challenge28Page } from './challenge28.js';

const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8' } });

async function saveOptionalLead(request, env) {
  if (!env.DB) return json({ ok:false,error:'Lead storage is unavailable.' },503);
  let body; try { body=await request.json(); } catch { return json({ok:false,error:'Invalid request.'},400); }
  const name=String(body?.name||'').trim().slice(0,100), email=String(body?.email||'').trim().toLowerCase().slice(0,254);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ok:false,error:'Please enter a valid email or choose Skip for now.'},400);
  const now=Date.now();
  try { await env.DB.prepare(`CREATE TABLE IF NOT EXISTS optional_leads (id TEXT PRIMARY KEY,name TEXT,email TEXT NOT NULL UNIQUE,source TEXT NOT NULL DEFAULT '7-day-completion',created_at INTEGER NOT NULL,updated_at INTEGER NOT NULL)`).run(); await env.DB.prepare(`INSERT INTO optional_leads (id,name,email,source,created_at,updated_at) VALUES (?,?,?,'7-day-completion',?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,updated_at=excluded.updated_at`).bind(crypto.randomUUID(),name||null,email,now,now).run(); return json({ok:true}); } catch(e){ console.error('optional_lead_save_failed',e); return json({ok:false,error:'We could not save your information right now. You can still continue.'},500); }
}

function enhanceChallenge(html){
 const oldActions=`<div class="completion-actions"><a href="/">RETURN HOME</a><span>14-Day Momentum is your next step.</span></div>`;
 const newActions=`<div class="completion-actions"><a href="/challenges/14-day-get-active">VIEW 14-DAY GET ACTIVE</a><span>Complete all 7 days to unlock the next challenge.</span></div>`;
 return html.replace(oldActions,newActions);
}

export default { async fetch(request,env,ctx){
 const url=new URL(request.url), p=url.pathname.replace(/\/$/,'')||'/';
 if(request.method==='POST'&&p==='/api/optional-lead') return saveOptionalLead(request,env);
 if(request.method==='GET'&&p==='/momentum') return Response.redirect(new URL('/challenges/14-day-get-active',url),302);
 if(request.method==='GET'&&p==='/challenges/14-day-get-active') return new Response(challenge14Page(),{status:200,headers:{'content-type':'text/html; charset=utf-8'}});
 if(request.method==='GET'&&p==='/challenges/21-day-consistency') return new Response(challenge21Page(),{status:200,headers:{'content-type':'text/html; charset=utf-8'}});
 if(request.method==='GET'&&p==='/challenges/28-day-mastery') return new Response(challenge28Page(),{status:200,headers:{'content-type':'text/html; charset=utf-8'}});
 const response=await app.fetch(request,env,ctx);
 if(request.method!=='GET'||p!=='/challenge') return response;
 const type=response.headers.get('content-type')||''; if(!type.includes('text/html')) return response;
 const html=enhanceChallenge(await response.text()),headers=new Headers(response.headers); headers.set('content-type','text/html; charset=utf-8'); return new Response(html,{status:response.status,headers});
}};
