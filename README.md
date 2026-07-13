# Volunteer Transportation Center

Website for the Volunteer Transportation Center, Inc. — a static site built with
Hugo, deployed to GitHub Pages, and editable by non-technical contributors
through Pages CMS.

## Running the site locally

Requires [Hugo](https://gohugo.io) (extended, 0.146 or newer) and Node 20+.

```bash
npm install       # once, installs Tailwind and Alpine
npm run dev       # dev server with live reload at http://localhost:1313
npm run build     # production build to public/
npm run clean     # removes build artifacts
```

## How the site works

In simple terms:

- **Hugo** turns plain-text files into the finished website. There is no
  database and no server-side code — the whole site is static files.
- **Content lives in text files.** Page copy is Markdown in `content/`; every
  editable fact (phone numbers, stats, people, events, photos) lives in small
  YAML files in `data/`. Templates in `layouts/` turn those into pages.
- **Publishing is automatic.** Every push to `main` triggers GitHub Actions
  (`.github/workflows/hugo.yaml`), which builds the site and deploys it to
  GitHub Pages. A change is live about two minutes after it lands on `main`.
- **Non-technical editing happens through [Pages CMS](https://pagescms.org)** —
  a hosted form UI over this repo (nothing to install or host). Editor saves are
  git commits to `main`, so they publish automatically and anything can be
  reverted. See [For contributors](#for-contributors-writing-posts-and-photos) below.
- **The events calendar** at `/events/calendar/` reads a Google Calendar in the
  browser, so event upkeep happens in Google Calendar, not in this repo. Until
  the real calendar is connected it runs in a clearly-labeled preview mode on
  `static/data-samples/calendar-sample.json`.

## Maintaining the site (developer notes)

### Where things live

| To change… | Edit… |
| --- | --- |
| Contact info, phone lines, stats, mission, donate/apply links, social URLs | [data/site.yaml](data/site.yaml) |
| Staff on About Us | [data/people.yaml](data/people.yaml) |
| Board members | [data/boards.yaml](data/boards.yaml) |
| Offices on Contact Us | [data/offices.yaml](data/offices.yaml) |
| Annual events / sponsors on Events | [data/events.yaml](data/events.yaml) / [data/sponsors.yaml](data/sponsors.yaml) |
| Forms on the Forms page | [data/forms.yaml](data/forms.yaml) |
| Scrapbook photos and captions | [data/scrapbook.yaml](data/scrapbook.yaml) |
| Posts (event recaps at `/posts/`) | `content/posts/<post>.md` — or the CMS, see below |
| Post photos / printable flyers | `assets/images/posts/` / `static/files/flyers/` |
| The text of a page | `content/<page>.md` (plain Markdown) |
| The navigation menu | `hugo.yaml` under `menu:` |
| Downloadable PDFs/documents | `static/files/` — anything there is served at `/files/<name>` |

Each data file starts with a comment explaining its exact format.

### Conventions that matter

- **Everything editable lives in `data/`** — never hardcode a fact, phone
  number, URL, or stat in a template if it could live in `data/site.yaml`.
- **Internal URLs go through the `url.html` partial** in templates (GitHub
  Pages can serve the site under a subpath; bare root-relative paths break
  there). Markdown links are handled automatically by the render hooks.
- **Headings:** the front-matter `title` is the H1 — content files start their
  sections at `##`, never `#`, and don't go deeper than `###`. An optional
  `subtitle` param shows under the H1.
- `LINKS.md` is an inventory of every link in the content — regenerate it with
  `./scripts/gen_links.sh` after content changes.

### Media rules and the deploy guard

Editor photo uploads are **JPEG only, 2 MB max**; flyers are PDF. The CMS
restricts file types; sizes are enforced by
[scripts/check_media.sh](scripts/check_media.sh), which runs in the deploy
workflow and **fails the build on a bad upload** (the previous version of the
site stays live — check the Actions tab if a save never appeared). The build
generates the served sizes (~50 KB thumbnails, ~200 KB lightbox images), so
visitors never download originals.

The CMS form itself is defined in [.pages.yml](.pages.yml): the Posts
collection plus guarded editing of `data/events.yaml` and `data/scrapbook.yaml`.
Rolling back an editor change: `git revert <sha> && git push`.

### Connecting the real events calendar (one-time)

1. In a VTC-owned Google account, create the calendar, make it public
   (Settings → Access permissions → *Make available to public*), and share edit
   access with whoever maintains events.
2. In Google Cloud Console: create a project, enable the *Google Calendar API*,
   create an **API key**, and restrict it (API restriction: Calendar API only;
   Application restriction: HTTP referrers for `volunteertransportation.org/*`
   and `turnkeytrips.github.io/*`).
3. Add the key as a repo secret named `GCAL_API_KEY` (Settings → Secrets and
   variables → Actions). It is injected at build time and never committed.
4. Put the calendar ID (Settings → *Integrate calendar*, looks like
   `abc123@group.calendar.google.com`) into `data/site.yaml` under
   `calendar.google_calendar_id`, then push.

Linking a calendar event to more info (a site post, Facebook event, registration
form, etc.): paste the URL into the Google Calendar event's **description** — the
site turns URLs in descriptions into clickable links automatically.

### Deploy details

Push to `main` deploys via `.github/workflows/hugo.yaml`. One-time repo setup:
Settings → Pages → Source → GitHub Actions.

Custom domain: leave the Pages "Custom domain" field **empty** until DNS
resolves (a configured-but-dead domain redirects the github.io URL into the
void). Once the apex `A` records (185.199.108.153 / .109 / .110 / .111) and the
`www` CNAME record point at GitHub, enter the domain in Settings → Pages and
enable Enforce HTTPS. No CNAME file in the repo is needed — Actions-based
deploys ignore it — and the workflow picks up the right base URL automatically
on the next build.

### Style guide

Design tokens live in [assets/css/main.css](assets/css/main.css) under `@theme`. Change a value there and it applies site-wide.

#### Colors

| Token | Hex | Used for |
| --- | --- | --- |
| `brand-950` | `#12273a` | Footer background |
| `brand-900` | `#1b3c56` | Page H1 headings |
| `brand-800` | `#1a4666` | Hero/dark panels, big stats, card headings |
| `brand-700` | `#1a527b` | Links, primary buttons, icons |
| `brand-500` | `#2980b3` | Small icons, secondary accents |
| `brand-100` / `brand-50` | `#d9eaf5` / `#eef6fb` | Icon chips, page-header band, hover tints |
| `accent-500` / `accent-600` | `#f97b07` / `#dd5702` | Donate buttons and calls to action (hover) |
| `accent-100` | `#ffecc6` | County-restriction badges, accent icon chips |
| Tailwind `slate` scale | — | All body text (`slate-800`), secondary text (`slate-600`), borders (`slate-200`) |

The brand palette is still a placeholder until official VTC colors are confirmed.

#### Typography

Font: the system UI sans-serif stack (`--font-sans` in main.css) — no webfonts loaded.

| Role | Classes | Renders at |
| --- | --- | --- |
| Page H1 | `text-3xl sm:text-4xl font-bold tracking-tight text-brand-900` | 30px / 36px |
| Page subtitle | `text-slate-600` | 16px |
| Section H2 (layouts) | `text-2xl font-bold tracking-tight text-slate-900` | 24px |
| Card H3 | `font-bold text-slate-900` (or `text-lg` for large cards) | 16–18px |
| Body / prose | Tailwind Typography `prose prose-slate` | 16px, 1.75 line height |
| Prose `##` / `###` | styled by the typography plugin | 24px / 20px |
| Small text, captions | `text-sm` / `text-xs` | 14px / 12px |

Every page's H1 band comes from one partial: [layouts/_partials/page-header.html](layouts/_partials/page-header.html). Markdown body content is rendered with one canonical prose class string (`prose prose-slate … prose-a:text-brand-700 …`) — copy it from [layouts/page.html](layouts/page.html) if you add a new layout.

### Common recipes

**Add a staff member** — in `data/people.yaml`, add two lines under the right team:

```yaml
- name: Jane Doe
  title: Transportation Coordinator
```

Optionally give them photos and a one-line blurb (photo files go in `static/images/people/`):

```yaml
  photo: /images/people/jane-doe.jpg
  photo2: /images/people/jane-doe-fun.jpg   # shown on hover
  blurb: One friendly sentence about Jane.
```

**Add a scrapbook photo** — put the image in `static/images/scrapbook/`, then add to `data/scrapbook.yaml`:

```yaml
- image: /images/scrapbook/my-photo.jpg
  caption: One line describing the moment.
```

**Change a number** (miles, drivers, years, mileage rate) — edit the value in `data/site.yaml`; every page that shows it updates.

**Edit a page's text** — open the matching file in `content/` (e.g. `content/faq.md`) and edit the Markdown.

**Add a page** — create `content/my-page.md` with front matter (`title:`, `date:`, `draft: false`), write Markdown, then add a menu entry in `hugo.yaml` if it should appear in the nav.

**Remove a menu item** — delete its block under `menu:` in `hugo.yaml`. An item becomes a dropdown automatically when other entries list it as `parent:`.

### Migration leftovers

- `_old_site_files/` (gitignored) holds the original WordPress export and media. Old posts/events were moved to `_old_site_files/hugo-archive-content/` and are not part of the build.
- All downloadable documents (PDFs, application forms) have been migrated into `static/files/` and are bundled with the site — no external hosting needed. To swap a document for a newer version, replace the file in `static/files/` (or add the new one and update its entry in `data/forms.yaml`).
- A handful of *images* still point at old `/wp/wp-content/uploads/` paths (logo, headshot, partner logos on the county/foundation pages); the files are in `_old_site_files/WEBSITE-CONTENT/<year>/` and need a migration pass.
- Reports generated from the WordPress export (page inventory, menu structure, etc.) are in `_old_site_files/migration-reports/` (local only, gitignored).

## For contributors (writing posts and photos)

You don't need to know git, Hugo, or anything in this README to publish on the
site. Here's the whole workflow:

1. **Create a free [GitHub](https://github.com) account** (if you don't have
   one) and tell the site administrator your username — they'll send you a
   collaborator invitation by email. Accept it.
2. **Go to [app.pagescms.org](https://app.pagescms.org)**, click **Sign in with
   GitHub**, authorize it, and pick the **volunteer-transportation-center** site.
   Bookmark the page — this is the only site you need.
3. **Edit through the forms.** The sidebar has three sections:
   - **Posts** — event recaps and updates shown at `/posts/`, on the Events
     page, and on the home page. A post is a title, dates, a one-sentence
     summary, photos, an optional Google Photos album link, an optional PDF
     flyer, and the write-up.
   - **Annual events** — the recurring events listed on `/events/`.
   - **Scrapbook** — the photo wall at `/scrapbook/`.
4. **Click Save and you're published.** The site rebuilds itself; your change
   is live about two minutes later. Made a mistake? Open the entry, fix it,
   Save again — or flip a post's "Hide from the site" switch.

Photo rules: **JPEG only, 2 MB max per photo** (pick the **Large** size when
your phone or Google Photos asks). Flyers: PDF. The Scrapbook and Posts keep
separate photo libraries — upload a photo in both places if it belongs in both.

**[EDITING.md](EDITING.md) is the full step-by-step walkthrough** — send it to
any new contributor.
