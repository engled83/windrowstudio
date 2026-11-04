// Paste this entire file into a Cloudflare Worker's code editor.
// Required secrets: STUDIO_PIN and RIVERSIDE_URL. Neither belongs in this file.
const headers = {
  "Cache-Control": "no-store, max-age=0",
  "Content-Type": "text/html; charset=utf-8",
  "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self' https://riverside.com; base-uri 'none'; frame-ancestors 'none'",
  // Keep same-site form POST origins intact while withholding cross-site referrers.
  "Referrer-Policy": "same-origin",
  "X-Content-Type-Options": "nosniff",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
};

function page(message = "", status = 200, allowForm = true) {
  return new Response(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="robots" content="noindex,nofollow">
  <title>Join the Studio | Look Who It Is!</title>
  <style>
    :root { color-scheme:dark; }
    * { box-sizing:border-box; }
    body { margin:0; min-height:100svh; display:grid; place-items:center; padding:24px;
      background:radial-gradient(ellipse at top,#123323 0%,#090d0b 65%); color:#f3f6fb;
      font:17px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif; }
    main { width:min(100%,400px); }
    .brand { margin:0 0 12px; color:#42dc91; font-size:14px; font-weight:700; }
    h1 { margin:0; font-size:clamp(30px,7vw,38px); letter-spacing:-.04em; line-height:1.15; }
    p { margin:16px 0 24px; color:#d8dfdb; }
    label { display:block; margin-bottom:8px; font-weight:600; }
    input { display:block; width:100%; min-height:60px; padding:12px; border:1px solid #52645a;
      border-radius:6px; background:#111713; color:#f3f6fb; text-align:center;
      font:26px/1.3 system-ui,sans-serif; letter-spacing:.25em; }
    button { width:100%; min-height:52px; margin-top:16px; padding:12px 20px; border:0;
      border-radius:6px; background:#18be70; color:#031a0e; font:700 17px/1.4 system-ui,sans-serif; cursor:pointer; }
    button:hover { background:#42dc91; }
    button:active { transform:scale(.99); }
    :focus-visible { outline:3px solid #42dc91; outline-offset:4px; }
    .message { color:#ffcfad; margin:16px 0; }
    footer { margin-top:28px; color:#aab5af; font-size:14px; }
  </style>
</head>
<body>
  <main>
    <p class="brand">Look Who It Is!</p>
    <h1>Join the studio</h1>
    ${allowForm ? `<p>Enter the four-digit code Dane sent you.</p>
    <form method="post">
      <label for="pin">Access code</label>
      <input id="pin" name="pin" type="password" inputmode="numeric" pattern="[0-9]{4}"
        minlength="4" maxlength="4" autocomplete="one-time-code" enterkeyhint="go"
        required aria-describedby="message" ${status === 403 ? 'aria-invalid="true"' : ""}>
      <p id="message" class="message" role="status">${message}</p>
      <button type="submit">Join studio</button>
    </form>` : `<p class="message" role="status">${message}</p>`}
    <footer>Hosted by Dane Engle</footer>
  </main>
</body>
</html>`, { status, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!["/studio", "/studio/", "/studio/index.html", "/"].includes(url.pathname)) {
      return new Response("Not found", { status: 404, headers });
    }
    if (!["GET", "HEAD", "POST"].includes(request.method)) {
      return new Response("Method not allowed", {
        status: 405, headers: { ...headers, Allow: "GET, HEAD, POST" },
      });
    }

    let destination;
    try { destination = new URL(env.RIVERSIDE_URL); } catch { /* Fail closed below. */ }
    if (!/^\d{4}$/.test(env.STUDIO_PIN || "") || !destination ||
        destination.protocol !== "https:" || destination.hostname !== "riverside.com" ||
        destination.username || destination.password || !destination.pathname.startsWith("/studio/")) {
      return page("The studio link is not ready yet. Please contact Dane.", 503, false);
    }
    if (request.method === "HEAD") return new Response(null, { headers });
    if (request.method === "GET") return page();

    const origin = request.headers.get("Origin");
    if (origin && origin !== url.origin) return page("Please open the studio link and try again.", 403);
    if (!request.headers.get("Content-Type")?.toLowerCase().startsWith("application/x-www-form-urlencoded")) {
      return page("Please enter your code using the form.", 400);
    }
    if (Number(request.headers.get("Content-Length")) > 1024) return page("Please enter just the four-digit code.", 413);
    let body;
    try { body = await request.text(); } catch { return page("Please try again.", 400); }
    if (body.length > 1024) return page("Please enter just the four-digit code.", 413);
    const pin = new URLSearchParams(body).get("pin") || "";
    if (!/^\d{4}$/.test(pin) || pin !== env.STUDIO_PIN) return page("That code is not correct. Please try again.", 403);

    return new Response(null, {
      status: 303,
      headers: { ...headers, Location: destination.href },
    });
  },
};
