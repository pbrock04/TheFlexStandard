export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Standard CORS Headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle OPTIONS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // 1. Slack Events Endpoint (Verification & Events)
    if (url.pathname === '/slack/events' && request.method === 'POST') {
      try {
        const body = await request.json();

        // Respond to Slack's URL Verification challenge
        if (body.type === 'url_verification') {
          return new Response(JSON.stringify({ challenge: body.challenge }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Immediate 200 OK acknowledgment for incoming Slack events
        return new Response('OK', { status: 200 });
      } catch (err) {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    // 2. Answers / Article Route: Rebuilding Discipline From Zero
    if (url.pathname === '/answers/rebuilding-discipline-from-zero') {
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rebuilding Discipline From Zero | The Flex Standard</title>
  <meta name="description" content="A practical, zero-friction blueprint to rebuild personal discipline when motivation has run dry.">
  <style>
    :root { --bg: #0d1117; --card: #161b22; --text: #c9d1d9; --accent: #f59e0b; --heading: #ffffff; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--bg); color: var(--text); line-height: 1.6; margin: 0; padding: 2rem 1rem; }
    .container { max-width: 720px; margin: 0 auto; background: var(--card); border: 1px solid #30363d; border-radius: 8px; padding: 2.5rem; }
    h1, h2 { color: var(--heading); }
    a { color: var(--accent); text-decoration: none; }
    ul { padding-left: 1.5rem; margin: 1.5rem 0; }
    li { margin-bottom: 0.75rem; }
    .cta-btn { display: inline-block; background: var(--accent); color: #000000; font-weight: bold; padding: 0.75rem 1.5rem; border-radius: 6px; margin-top: 1.5rem; }
    .cta-btn:hover { opacity: 0.9; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Rebuilding Discipline From Zero</h1>
    <p>Discipline is not an innate trait; it is a system of lowering friction until execution becomes automatic.</p>
    <h2>The 3-Step Standard</h2>
    <ul>
      <li><strong>Shrink the Initial Action:</strong> Reduce the entry barrier so small that quitting takes more effort than finishing (e.g., 5 push-ups, 5-minute walk).</li>
      <li><strong>Enforce Non-Negotiable Time Blocks:</strong> Schedule actions by clock time, not feeling or convenience.</li>
      <li><strong>Log Progress Daily:</strong> Accountability compounds through consistent daily tracking.</li>
    </ul>
    <p><a href="/#challenge" class="cta-btn">Start the 7-Day Kickstart</a></p>
  </div>
</body>
</html>`;

      return new Response(html, {
        status: 200,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }

    // 3. Database / API Example Route
    if (url.pathname.startsWith('/api/')) {
      try {
        if (env.DB) {
          return new Response(JSON.stringify({ found: true, status: 'Database connected' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    // 4. Default 404 Fallback
    return new Response(JSON.stringify({ error: 'Not Found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  },
};