export default {
  async fetch(request, env, ctx) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>The Flex Standard – Focus. Learn. Execute. Excel.</title>
  <meta name="robots" content="noindex, nofollow, noarchive, nosnippet">
  <style>
    :root {
      --bg: #0a0a0a;
      --card: #141414;
      --soft: #1a1a1a;
      --border: #262626;
      --gold: #d4af37;
      --gold2: #b8860b;
      --text: #ededed;
      --muted: #a1a1a1;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    a {
      color: inherit;
      text-decoration: none;
    }
    .nav {
      border-bottom: 1px solid var(--border);
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: rgba(10, 10, 10, 0.95);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .brand {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: 0.05em;
      color: var(--gold);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    main {
      flex: 1;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
      width: 100%;
    }
    .hero {
      text-align: center;
      margin-bottom: 3.5rem;
    }
    .hero-banner-container {
      width: 100%;
      margin-bottom: 2rem;
      display: flex;
      justify-content: center;
      overflow: hidden;
      border-radius: 12px;
      border: 1px solid var(--border);
      background-color: #0b0806;
    }
    .hero-banner-img {
      width: 100%;
      max-width: 1100px;
      height: auto;
      display: block;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: var(--soft);
      border: 1px solid var(--border);
      color: var(--gold);
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
      letter-spacing: -0.02em;
    }
    .section {
      margin-bottom: 3rem;
    }
    .heading {
      font-size: 1.75rem;
      color: var(--gold);
      margin-bottom: 1.5rem;
      text-align: center;
    }
    .challenge-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 2rem;
      margin-top: 1.5rem;
    }
    footer {
      border-top: 1px solid var(--border);
      padding: 2rem;
      text-align: center;
      color: var(--muted);
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <header>
    <div class="nav">
      <a href="/" class="brand">THE FLEX STANDARD</a>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="hero-banner-container">
        <img 
          src="/hero-banner.png" 
          alt="The Flex Standard - Become Your Standard, Live the Flex" 
          class="hero-banner-img"
        />
      </div>
      <div class="badge">Free 7-Day Foundation</div>
      <h1>Focus. Learn. Execute. Excel.</h1>
    </section>

    <section class="section" id="standard">
      <h2 class="heading">The F.L.E.X. Standard</h2>
      <div class="challenge-card">
        <p style="text-align: center; color: var(--muted);">
          Building discipline, mental focus, physical strength, and financial independence.
        </p>
      </div>
    </section>

    <section class="challenge" id="kickstart">
      <div class="challenge-card">
        <h3 style="color: var(--gold); margin-bottom: 1rem;">7-Day Kickstart Challenge</h3>
        <p style="color: var(--muted); margin-bottom: 1.5rem;">
          Track your daily foundation tasks and build consistency one day at a time.
        </p>
        <div id="tasks-list"></div>
      </div>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 The Flex Standard. All rights reserved.</p>
  </footer>

  <script>
    const KEY = 'flexstandard.kickstart7.v1';
    const DATA = [
      'Set Your Daily Non-Negotiable',
      '10-Minute Mindset & Focus Session',
      'Physical Movement & Strength Drill',
      'Financial Discipline Habit',
      'Execute Key Priority Milestone',
      'Reflect, Review & Log Growth',
      'Lock in the Weekly Standard'
    ];

    const container = document.getElementById('tasks-list');
    if (container) {
      const list = document.createElement('ul');
      list.style.listStyle = 'none';
      list.style.padding = '0';

      DATA.forEach((task, index) => {
        const item = document.createElement('li');
        item.style.padding = '0.75rem 0';
        item.style.borderBottom = '1px solid var(--border)';
        item.style.display = 'flex';
        item.style.alignItems = 'center';
        item.style.gap = '0.75rem';

        item.innerHTML = '<span style="color: var(--gold); font-weight: bold;">Day ' + (index + 1) + ':</span> <span>' + task + '</span>';
        list.appendChild(item);
      });

      container.appendChild(list);
    }
  </script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' }
    });
  }
};
