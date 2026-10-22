# Studio PIN page

This Worker serves a small PIN form at https://windrowstudio.com/studio.
It checks the PIN on Cloudflare and returns a 303 redirect to Riverside after a match.
The PIN and destination are Cloudflare secrets, not browser code.
No cookies, accounts, database, or browser JavaScript are needed.

## Dashboard setup

1. In Cloudflare, open Workers & Pages and create a Worker named `windrow-studio`.
   Start with the Hello World template, deploy it, and select Edit code.
2. Replace the template with the entire contents of `studio-worker.mjs` and deploy.
3. Open the Worker's Settings > Variables and Secrets > Add.
   Add two entries with type **Secret**:
   - `STUDIO_PIN`: your chosen four-digit PIN.
   - `RIVERSIDE_URL`: your full Riverside studio guest URL, beginning with `https://riverside.com/studio/`.
   Deploy the changes.
4. Test the Worker's `workers.dev` URL first. The homepage should show the PIN form.
   A wrong code should stay on the form. Your correct code should open Riverside.
5. For the short link, `windrowstudio.com` must be an active Cloudflare zone,
   and its existing DNS records must be proxied (orange cloud).
   Preserve the existing GitHub Pages DNS targets. Do not replace them with the Worker.
   If the domain is not managed through Cloudflare yet, stop here and arrange that first;
   nameserver changes need the complete existing DNS zone, including email records.
6. Open the Worker > Settings > Domains & Routes > Add > Route.
   Select the `windrowstudio.com` zone and enter `windrowstudio.com/studio*`.
   If offered a failure mode, select **Fail closed / Block**.
   Add the route. This is a Worker route, not a custom domain for your entire site.
7. If you also share the www address, add `www.windrowstudio.com/studio*` as a
   second route and make sure its DNS record is proxied too.
8. Open https://windrowstudio.com/studio in a private window.
   Verify the wrong code stays out and the right code opens Riverside.
   Also test `/studio/` and `/studio/index.html`.

The route matches a prefix. Other paths beginning with `/studio` deliberately
return 404 instead of falling through to the old redirect. The Worker homepage
at `/` exists for testing on `workers.dev`; never attach it to a whole-site route.

## Existing GitHub redirect

The existing GitHub `studio/index.html` still redirects directly until you attach
the Worker route. After the Worker is working, replace that old page with a
message asking guests to use https://windrowstudio.com/studio, with no Riverside
link or automatic redirect. This removes the direct shortcut from the current
GitHub Pages origin. Its old destination remains in public Git history.

## Limits and maintenance

- This is a simple shared PIN gate. It does not include guessing rate limits.
  For additional protection, add a Cloudflare rate limiting rule for POST requests
  to `/studio` before sharing the link widely.
- Anyone who already knows the Riverside URL can still use it directly.
  This Worker cannot revoke that Riverside URL or protect Git history.
- Responses use `no-store`. Exclude `/studio*` from any Cloudflare Cache Everything
  rule or redirect rule that would bypass the Worker.
- Change the PIN by editing the `STUDIO_PIN` secret and deploying again.

Official references:
- https://developers.cloudflare.com/workers/configuration/secrets/
- https://developers.cloudflare.com/workers/configuration/routing/routes/
