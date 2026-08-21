const json = (data, status = 200, extraHeaders = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,OPTIONS",
      "access-control-allow-headers": "content-type",
      ...extraHeaders,
    },
  });

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "content-type",
        },
      });
    }

    if (url.pathname === "/health") {
      return json({ ok: true, service: "the-flex-standard" });
    }

    if (url.pathname === "/api/profile" && request.method === "GET") {
      return json({ ok: true, profile: null });
    }

    if (url.pathname === "/api/challenge/progress" && request.method === "POST") {
      if (!env.DB) return json({ ok: false, error: "DB binding unavailable" }, 503);

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: "Invalid JSON body" }, 400);
      }

      const { user_id, challenge_days, current_day, completed = false } = body || {};
      if (!user_id || !Number.isInteger(challenge_days) || !Number.isInteger(current_day)) {
        return json({ ok: false, error: "user_id, challenge_days, and current_day are required" }, 400);
      }

      await env.DB.prepare(
        `INSERT INTO challenge_progress (user_id, challenge_days, current_day, completed, updated_at)
         VALUES (?, ?, ?, ?, datetime('now'))
         ON CONFLICT(user_id, challenge_days)
         DO UPDATE SET current_day = excluded.current_day,
                       completed = excluded.completed,
                       updated_at = datetime('now')`
      ).bind(user_id, challenge_days, current_day, completed ? 1 : 0).run();

      return json({ ok: true });
    }

    return env.ASSETS ? env.ASSETS.fetch(request) : json({ ok: false, error: "Not found" }, 404);
  },
};
