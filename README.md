# Windrow Studio website

Static GitHub Pages site for [windrowstudio.com](https://windrowstudio.com/).

## Structure

- `index.html` — homepage
- `about/` — about page
- `contact/` — contact page
- `podcast/` — Look Who It Is! podcast homepage
- `podcast/episodes/` — individual episode pages
- `assets/images/branding/` — site and podcast branding
- `assets/images/episodes/` — episode artwork
- `tracker/` — standalone calorie tracker
- `guest/` — compatibility redirect to the current guest application
- Root-level legacy `.html` pages — compatibility redirects for old public links

## Conventions

- Use root-relative internal URLs such as `/podcast/` and `/assets/images/branding/windrow-logo.png`.
- Add new episode pages at `podcast/episodes/<guest-slug>/index.html`.
- Add new episode artwork under `assets/images/episodes/`.
- Update `sitemap.xml` whenever a public page is added, moved, or removed.
- The current guest application and accepted-guest portal are hosted at `guests.windrowstudio.com`.
