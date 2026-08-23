export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // ============================================================
    // HERO BANNER
    // ============================================================
    if (url.pathname === "/hero-banner.png") {
      const asset = await fetch(
        "https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/hero-banner.png"
      );

      if (!asset.ok || !asset.body) {
        return new Response("Hero banner unavailable", { status: 502 });
      }

      return new Response(asset.body, {
        status: 200,
        headers: {
          "content-type": "image/png",
          "cache-control": "public, max-age=86400"
        }
      });
    }

    // ============================================================
    // HERO VIDEO
    // ============================================================
    if (url.pathname === "/flex-hero-web.mp4") {
      const asset = await fetch(
        "https://raw.githubusercontent.com/pbrock04/TheFlexStandard/main/flex-hero-web.mp4"
      );

      if (!asset.ok || !asset.body) {
        return new Response("Hero video unavailable", { status: 502 });
      }

      return new Response(asset.body, {
        status: 200,
        headers: {
          "content-type": "video/mp4",
          "cache-control": "public, max-age=86400"
        }
      });
    }

    const isStandardPage =
      url.pathname === "/standard" ||
      url.pathname === "/standard/";

    // ============================================================
    // PAGE CONTENT
    // ============================================================
    const pageContent = isStandardPage
      ? `
<section class="standard-hero reveal visible">
  <div class="badge">THE FLEX STANDARD</div>

  <h1>
    Focus. Learn. Execute.
    <span class="gold">eXcel.</span>
  </h1>

  <p class="sub">
    Four principles. One standard. Build yourself one deliberate
    action at a time.
  </p>
</section>

<section class="section reveal visible" id="standard">

  <div class="flex-grid">

    <article class="flex-card">
      <div class="letter">F</div>
      <h3>Focus</h3>
      <p>
        Choose what matters. Cut the noise. Set the target.
      </p>
    </article>

    <article class="flex-card">
      <div class="letter">L</div>
      <h3>Learn</h3>
      <p>
        Build knowledge, awareness, and the skills to move forward.
      </p>
    </article>

    <article class="flex-card">
      <div class="letter">E</div>
      <h3>Execute</h3>
      <p>
        Turn intention into action. Do the work when it counts.
      </p>
    </article>

    <article class="flex-card">
      <div class="letter">X</div>
      <h3>eXcel</h3>
      <p>
        Repeat the standard. Improve it. Become who you said
        you would be.
      </p>
    </article>

  </div>

</section>

<section class="cta reveal visible">

  <h2>Live The Standard.</h2>

  <p class="cta-copy">
    Know the principles. Put them into practice one day at a time.
  </p>

  <a href="/">
    BACK TO HOME
  </a>

</section>
`
      : `
<section class="hero">

  <!-- EXISTING HERO BANNER -->
  <div class="hero-banner-container">
    <img
      src="/hero-banner.png"
      alt="The Flex Standard - Become Your Standard, Live the Flex"
      class="hero-banner-img"
    >
  </div>

  <!-- NEW VIDEO ADDED TO EXISTING HERO -->
  <div class="hero-video-container">

    <video
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
      preload="metadata"
      poster="/hero-banner.png"
    >
      <source
        src="/flex-hero-web.mp4"
        type="video/mp4"
      >
    </video>

  </div>

  <!-- EXISTING HERO
