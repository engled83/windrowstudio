# Windrow Studio website

Static GitHub Pages site for [windrowstudio.com](https://windrowstudio.com/).

## Structure

- `index.html` — homepage
- `about/` — about page
- `contact/` — contact page
- `faq/`: common questions about the show, guest applications, and recording
- `podcast/` — Look Who It Is! podcast homepage
- `podcast/episodes/` — individual episode pages
- `assets/images/branding/` — site and podcast branding
- `assets/images/episodes/` — episode artwork
- `assets/site.css` — shared public-page layout, navigation, and visual styles
- `assets/site.js` — responsive navigation, footer year, and episode image fallbacks
- `guest/` — compatibility redirect to the current guest application
- Root-level legacy `.html` pages — compatibility redirects for old public links

## Conventions

- Use root-relative internal URLs such as `/podcast/` and `/assets/images/branding/windrow-logo.png`.
- Add new episode pages at `podcast/episodes/<guest-slug>/index.html`.
- Add new episode artwork under `assets/images/episodes/`.
- Update `sitemap.xml` whenever a public page is added, moved, or removed.
- The current guest application and accepted-guest portal are hosted at `guests.windrowstudio.com`.
- Public pages share the `ws-header` and `ws-footer` markup, plus `/assets/site.css` and `/assets/site.js`. Keep their navigation links consistent when adding a page.
- When publishing an episode, update the featured conversation and episode previews in `index.html` and `podcast/index.html`, along with the podcast's structured data. Keep episode titles, dates, and links aligned with the episode page.
- Prefer local episode artwork. Existing external images use the podcast logo as a fallback; keep descriptive guest names and working watch/listen links beside them.
- There is no build step. Preserve the existing contact form action and field names when changing its layout.

- Keep the visible FAQ questions and answers in `faq/index.html` aligned with its `FAQPage` structured data. FAQ-only styles live in `assets/faq.css`.
