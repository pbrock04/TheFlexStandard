export default {
  async fetch(request) {
    if (request.method === 'POST') {
      try {
        const body = await request.json();

        if (body?.type === 'url_verification') {
          return Response.json({ challenge: body.challenge });
        }

        return Response.json({ status: 'ignored' });
      } catch {
        return new Response('Invalid JSON', { status: 400 });
      }
    }

    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive,nosnippet">
  <title>The Flex Standard</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; }
    body {
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #050505;
      color: #f5f5f5;
      font-family: Arial, Helvetica, sans-serif;
    }
    main {
      width: min(92vw, 760px);
      padding: 48px 24px;
      text-align: center;
    }
    .mark {
      width: 72px;
      height: 72px;
      margin: 0 auto 28px;
      border: 1px solid #d4af37;
      border-radius: 50%;
      display: grid;
      place-items: center;
      color: #d4af37;
      font-weight: 800;
      letter-spacing: .08em;
    }
    h1 {
      margin: 0;
      font-size: clamp(2.25rem, 8vw, 5rem);
      line-height: .95;
      letter-spacing: -.04em;
      text-transform: uppercase;
    }
    p {
      margin: 22px auto 0;
      color: #b8b8b8;
      font-size: 1rem;
      letter-spacing: .08em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <main>
    <div class="mark">FLEX</div>
    <h1>The Flex Standard</h1>
    <p>New build starts here.</p>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=UTF-8',
        'Cache-Control': 'no-store'
      }
    });
  }
};
