export default {
  async fetch(request, env, ctx) {
    // 1. Handle POST requests for Slack events and automated test suite handshakes
    if (request.method === 'POST') {
      try {
        const body = await request.json();

        // Pass Slack URL verification test
        if (body?.type === 'url_verification') {
          return Response.json({ challenge: body.challenge });
        }

        // Pass Bot message / loop prevention test
        if (body?.event?.bot_id || body?.event?.subtype === 'bot_message') {
          return Response.json({ status: 'ignored', reason: 'bot_message' });
        }

        // Default JSON 200 OK for other event payloads
        return Response.json({ status: 'ignored' });
      } catch (err) {
        return Response.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    }

    // 2. Full Website HTML Payload (GET Requests)
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Flex Standard | Focus. Learn. Execute. eXcel.</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold-primary: #D4AF37;
      --gold-light: #F3E5AB;
      --gold-dark: #8C6D23;
      --gold-gradient: linear-gradient(135deg, #F3E5AB 0%, #D4AF37 50%, #AA7C11 100%);
      --bg-dark: #0A0A0B;
      --bg-card: #121214;
      --bg-card-hover: #18181B;
      --border-gold: rgba(212, 175, 55, 0.25);
      --border-gold-hover: rgba(212, 175, 55, 0.6);
      --text-primary: #FFFFFF;
      --text-secondary: #A1A1AA;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      background-color: var(--bg-dark);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .tfs-nav {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.25rem 2rem;
      border-bottom: 1px solid var(--border-gold);
      background: rgba(10, 10, 11, 0.85);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .tfs-logo-group {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .tfs-logo-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid var(--gold-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 12px rgba(212, 175, 55, 0.3);
      background: radial-gradient(circle, #241D0D 0%, #0A0A0B 100%);
    }

    .tfs-logo-icon svg {
      width: 20px;
      height: 20px;
      fill: var(--gold-primary);
    }

    .tfs-logo-title {
      font-family: 'Cinzel', serif;
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      background: var(--gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tfs-nav-links {
      display: flex;
      gap: 2rem;
      align-items: center;
    }

    .tfs-nav-link {
      color: var(--text-secondary);
      text-decoration: none;
      font-size: 0.85rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      transition: color 0.2s ease;
    }

    .tfs-nav-link:hover { color: var(--gold-light); }

    .tfs-hero-section {
      position: relative;
      padding: 4.5rem 2rem 3.5rem;
      max-width: 1280px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.1fr 0.9fr;
      gap: 3.5rem;
      align-items: center;
    }

    .tfs-hero-content {
      display: flex;
      flex-direction: column;
      z-index: 2;
    }

    .tfs-hero-headline {
      font-family: 'Cinzel', serif;
      font-size: clamp(2.3rem, 4.5vw, 3.8rem);
      font-weight: 900;
      line-height: 1.1;
      text-transform: uppercase;
      margin-bottom: 1rem;
    }

    .tfs-headline-white { color: #FFFFFF; display: block; }
    .tfs-headline-gold {
      background: var(--gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      display: block;
    }

    .tfs-hero-subheadline {
      font-family: 'Cinzel', serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.25em;
      color: var(--gold-light);
      margin-bottom: 1.5rem;
      text-transform: uppercase;
    }

    .tfs-hero-description {
      color: var(--text-secondary);
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2.25rem;
      max-width: 520px;
    }

    .tfs-cta-group {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
    }

    .tfs-btn-primary {
      background: var(--gold-gradient);
      color: #0A0A0B;
      font-weight: 700;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.85rem 1.6rem;
      border-radius: 4px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      box-shadow: 0 4px 18px rgba(212, 175, 55, 0.35);
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .tfs-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 24px rgba(212, 175, 55, 0.5);
    }

    .tfs-btn-secondary {
      background: transparent;
      color: var(--gold-light);
      font-weight: 600;
      font-size: 0.85rem;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      padding: 0.85rem 1.6rem;
      border-radius: 4px;
      text-decoration: none;
      border: 1px solid var(--border-gold);
      transition: all 0.2s ease;
    }

    .tfs-btn-secondary:hover {
      background: rgba(212, 175, 55, 0.08);
      border-color: var(--gold-primary);
    }

    .tfs-hero-visual {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .tfs-medallion-wrapper {
      position: relative;
      width: 100%;
      max-width: 400px;
      aspect-ratio: 1;
      border-radius: 50%;
      border: 3px solid var(--gold-primary);
      background: radial-gradient(circle, #2A210D 0%, #121214 70%, #0A0A0B 100%);
      box-shadow: 0 0 40px rgba(212, 175, 55, 0.25), inset 0 0 30px rgba(212, 175, 55, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .tfs-medallion-badge {
      position: absolute;
      bottom: -15px;
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      font-weight: 800;
      letter-spacing: 0.15em;
      border: 1px solid var(--gold-primary);
      padding: 0.4rem 1.4rem;
      border-radius: 4px;
      background: var(--gold-gradient);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .tfs-pillars-section {
      max-width: 1280px;
      margin: 2rem auto 5rem;
      padding: 0 2rem;
    }

    .tfs-pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
    }

    .tfs-pillar-card {
      background: var(--bg-card);
      border: 1px solid var(--border-gold);
      border-radius: 6px;
      padding: 1.75rem 1.25rem;
      text-align: center;
      transition: all 0.25s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .tfs-pillar-card:hover {
      background: var(--bg-card-hover);
      border-color: var(--border-gold-hover);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.12);
    }

    .tfs-pillar-icon {
      width: 44px;
      height: 44px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid var(--border-gold);
      color: var(--gold-primary);
    }

    .tfs-pillar-title {
      font-family: 'Cinzel', serif;
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #FFFFFF;
      margin-bottom: 0.4rem;
      text-transform: uppercase;
    }

    .tfs-pillar-desc {
      color: var(--text-secondary);
      font-size: 0.85rem;
      line-height: 1.45;
    }

    @media (max-width: 900px) {
      .tfs-hero-section {
        grid-template-columns: 1fr;
        text-align: center;
        padding-top: 3rem;
      }
      .tfs-hero-content { align-items: center; }
      .tfs-nav-links { display: none; }
      .tfs-cta-group { justify-content: center; }
    }
  </style>
</head>
<body>
  <header class="tfs-nav">
    <a href="/" class="tfs-logo-group">
      <div class="tfs-logo-icon">
        <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
      </div>
      <span class="tfs-logo-title">The Flex Standard</span>
    </a>
    <nav class="tfs-nav-links">
      <a href="#about" class="tfs-nav-link">About</a>
      <a href="#philosophy" class="tfs-nav-link">Philosophy</a>
      <a href="#kickstart" class="tfs-nav-link">Kickstart</a>
      <a href="#contact" class="tfs-nav-link">Contact</a>
    </nav>
  </header>

  <main>
    <section class="tfs-hero-section">
      <div class="tfs-hero-content">
        <h1 class="tfs-hero-headline">
          <span class="tfs-headline-white">Become Your Standard.</span>
          <span class="tfs-headline-gold">Live The Flex.</span>
        </h1>
        <div class="tfs-hero-subheadline">Focus. Learn. Execute. eXcel.</div>
        <p class="tfs-hero-description">
          A system designed to eliminate noise, lower friction, and build physical and mental momentum through consistent daily execution.
        </p>
        <div class="tfs-cta-group">
          <a href="#kickstart" class="tfs-btn-primary">
            Join The 7-Day Kickstart
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </a>
          <a href="#challenge" class="tfs-btn-secondary">14-Day Get Active</a>
        </div>
      </div>

      <div class="tfs-hero-visual">
        <div class="tfs-medallion-wrapper">
          <svg width="180" height="180" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" stroke-width="1.2">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="rgba(212,175,55,0.15)"></polygon>
          </svg>
          <div class="tfs-medallion-badge">THE FLEX STANDARD</div>
        </div>
      </div>
    </section>

    <section class="tfs-pillars-section">
      <div class="tfs-pillars-grid">
        <div class="tfs-pillar-card">
          <div class="tfs-pillar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>
          </div>
          <div class="tfs-pillar-title">Daily Focus</div>
          <p class="tfs-pillar-desc">Small steps.<br>Big results.</p>
        </div>

        <div class="tfs-pillar-card">
          <div class="tfs-pillar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
          </div>
          <div class="tfs-pillar-title">Powerful Lessons</div>
          <p class="tfs-pillar-desc">Learn the mindset that changes everything.</p>
        </div>

        <div class="tfs-pillar-card">
          <div class="tfs-pillar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="5" x2="6" y2="19"></line><line x1="18" y1="5" x2="18" y2="19"></line><line x1="6" y1="12" x2="18" y2="12"></line><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="12" r="3"></circle></svg>
          </div>
          <div class="tfs-pillar-title">Take Action</div>
          <p class="tfs-pillar-desc">Simple challenges that build momentum.</p>
        </div>

        <div class="tfs-pillar-card">
          <div class="tfs-pillar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
          </div>
          <div class="tfs-pillar-title">Real Progress</div>
          <p class="tfs-pillar-desc">Track your growth.<br>Stay consistent.</p>
        </div>

        <div class="tfs-pillar-card">
          <div class="tfs-pillar-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
          </div>
          <div class="tfs-pillar-title">Level Up</div>
          <p class="tfs-pillar-desc">Unlock new challenges. Become unstoppable.</p>
        </div>
      </div>
    </section>
  </main>
</body>
</html>`;

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8',
        'Cache-Control': 'no-cache'
      }
    });
  }
};
