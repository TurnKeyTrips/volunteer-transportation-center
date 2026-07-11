# Volunteer Transportation Center

Website for the Volunteer Transportation Center, Inc.

## Tech stack

- Hugo (extended, 0.146 or newer) — static site generator
- Tailwind CSS v4 — compiled by Hugo via `css.TailwindCSS` (requires the npm packages below)
- Alpine.js — small interactive bits (nav dropdowns, mobile menu), bundled by Hugo via `js.Build`
- GitHub Actions + GitHub Pages — build and hosting

## Build locally

Requires Hugo extended and Node 20+.

```bash
npm install       # once, installs Tailwind and Alpine
npm run dev       # dev server with live reload at http://localhost:1313
```

## Test a production build

```bash
npm run build     # outputs the full site to public/
npm run clean     # removes build artifacts
```

## Deploy

Push to `main`. The workflow in `.github/workflows/hugo.yaml` builds the site and deploys it to GitHub Pages. One-time repo setup: Settings → Pages → Source → GitHub Actions.

Custom domain: leave the Pages "Custom domain" field **empty** until DNS resolves (a configured-but-dead domain redirects the github.io URL into the void). Once the apex `A` records (185.199.108.153 / .109 / .110 / .111) and the `www` CNAME record point at GitHub, enter the domain in Settings → Pages and enable Enforce HTTPS. No CNAME file in the repo is needed — Actions-based deploys ignore it — and the workflow picks up the right base URL automatically on the next build.

## Style guide

Design tokens live in [assets/css/main.css](assets/css/main.css) under `@theme`. Change a value there and it applies site-wide.

### Colors

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

### Typography

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

### Content heading rules

- The page **title in front matter is the H1** — never write `# Heading` in a content file.
- Start body sections at `##`, subsections at `###`. Don't use `####` or deeper as pseudo-styling — use **bold text** instead.
- Optional `subtitle` front matter param shows under the H1 on standard pages.

## Making changes

The workflow for any change:

1. Edit the file (see below for which one).
2. Preview locally: `npm run dev`, then open http://localhost:1313. The page live-reloads as you save.
3. Commit and push to `main` — GitHub Actions rebuilds and deploys the live site automatically (takes a couple of minutes; watch the Actions tab).

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
| News posts (event recaps at `/news/`) | `content/news/<post>.md` — or the CMS, see below |
| News post photos / printable flyers | `assets/images/news/` / `static/files/flyers/` |
| The text of a page | `content/<page>.md` (plain Markdown) |
| The navigation menu | `hugo.yaml` under `menu:` |
| Downloadable PDFs/documents | `static/files/` — anything there is served at `/files/<name>` |

Each data file starts with a comment explaining its exact format.

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

**Edit a page's text** — open the matching file in `content/` (e.g. `content/faq.md`) and edit the Markdown. Rules: don't write `# Heading` (the page title in the front matter is the H1); start sections at `##`.

**Add a page** — create `content/my-page.md` with front matter (`title:`, `date:`, `draft: false`), write Markdown, then add a menu entry in `hugo.yaml` if it should appear in the nav.

**Remove a menu item** — delete its block under `menu:` in `hugo.yaml`. An item becomes a dropdown automatically when other entries list it as `parent:`.

## News posts and the CMS

A non-technical editor with a free GitHub account writes news posts through
[Pages CMS](https://pagescms.org) (a hosted form UI over this repo; nothing to
install or host). Each post has a write-up, a photo gallery, an optional Google
Photos album link, and an optional printable PDF flyer. Saves commit straight to
`main` and publish automatically in ~2 minutes; every change is a git commit, so
anything can be reverted.

- **[EDITING.md](EDITING.md) is the editor walkthrough** — send it to whoever
  will write posts (they must be added as a repo collaborator first).
- The CMS form is defined in [.pages.yml](.pages.yml): the news collection plus
  guarded editing of `data/events.yaml` and `data/scrapbook.yaml`.
- Photo rules: **JPEG only, 2 MB max per upload**. The CMS restricts extensions;
  sizes are enforced by [scripts/check_media.sh](scripts/check_media.sh), which
  runs in the deploy workflow and fails the build on a bad upload (the previous
  site version stays live). Editors should prefer the phone/Google Photos
  "Large" export size.
- The build generates the served sizes (~50 KB thumbnails, ~200 KB lightbox
  images), so visitors never download originals. Post pages get the same
  thumbnail + lightbox gallery as the Scrapbook.

## Coming soon: events calendar

One more feature is planned (see `docs/plans/`, local only):

**Events calendar** (built — running on sample data until connected) — a Google
Calendar owned by VTC is the source of truth. A designated person edits events in
Google Calendar (no GitHub needed); the site renders them live in a custom month
view at `/events/calendar/`, with a "Next Up" widget on the Events page and
subscribe buttons (Google / Apple / Outlook) so visitors get events in their own
calendars. Until the real calendar is connected, the pages run in a clearly-labeled
preview mode on `static/data-samples/calendar-sample.json`.

To connect the real calendar (one-time):

1. In a VTC-owned Google account, create the calendar, make it public
   (Settings → Access permissions → *Make available to public*), and share edit
   access with whoever maintains events.
2. In Google Cloud Console: create a project, enable the *Google Calendar API*,
   create an **API key**, and restrict it (API restriction: Calendar API only;
   Application restriction: HTTP referrers for `volunteertransportation.org/*` and
   `turnkeytrips.github.io/*`).
3. Add the key as a repo secret named `GCAL_API_KEY` (Settings → Secrets and
   variables → Actions). It is injected at build time and never committed.
4. Put the calendar ID (Settings → *Integrate calendar*, looks like
   `abc123@group.calendar.google.com`) into `data/site.yaml` under
   `calendar.google_calendar_id`, then push.

Linking a calendar event to more info (a site post, Facebook event, registration
form, etc.): paste the URL into the Google Calendar event's **description** — the
site turns URLs in descriptions into clickable links automatically.

## Notes

- `LINKS.md` is an inventory of every link in the content (regenerate with `./scripts/gen_links.sh`).
- `_old_site_files/` (gitignored) holds the original WordPress export and media. Old posts/events were moved to `_old_site_files/hugo-archive-content/` and are not part of the build.
- All downloadable documents (PDFs, application forms) have been migrated into `static/files/` and are bundled with the site — no external hosting needed. To swap a document for a newer version, replace the file in `static/files/` (or add the new one and update its entry in `data/forms.yaml`).
- A handful of *images* still point at old `/wp/wp-content/uploads/` paths (logo, headshot, partner logos on the county/foundation pages); the files are in `_old_site_files/WEBSITE-CONTENT/<year>/` and need a migration pass.
- Reports generated from the WordPress export (page inventory, menu structure, etc.) are in `_old_site_files/migration-reports/` (local only, gitignored).
