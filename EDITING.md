# Editing the site (no coding required)

This site can be edited through [Pages CMS](https://app.pagescms.org) — a friendly
web form that sits on top of the site's files. You log in, type, add photos, and
hit Save. The site rebuilds itself and your change is live in about two minutes.

## One-time setup

1. You need a free [GitHub](https://github.com) account, and the site's
   administrator must add you as a collaborator (you'll get an email invitation —
   accept it).
2. Go to [app.pagescms.org](https://app.pagescms.org) and click **Sign in with GitHub**.
3. Authorize Pages CMS when GitHub asks, then pick the
   **volunteer-transportation-center** site.

That's it. Bookmark the page.

## Writing a post

1. In the left sidebar, open **Posts** and click **Add entry**.
2. Fill in the form:
   - **Title** — the headline, e.g. "28th Annual Chili Cook-Off Wraps Up".
   - **Publish date** — today, usually. Newest posts appear first.
   - **Event date** — when the event happened (or will happen).
   - **Summary** — one sentence for the post cards. Short and sweet.
   - **Photos** — add as many as you like. **JPEG only, 2 MB max per photo.**
     When your phone or Google Photos asks what size to share, pick **Large** —
     that's well under the limit and plenty sharp. The site automatically
     creates the smaller sizes visitors actually download.
   - **Google Photos album link** — optional. If the full album lives on Google
     Photos, paste its share link and the post gets a "View full album" button.
   - **Printable flyer (PDF)** — optional. Upload a PDF and the post gets a
     download button.
   - **Show in the home page carousel** — on by default. The 5 newest posts
     with this on rotate in the banner at the top of the home page; switch it
     off for posts that shouldn't be featured there.
   - **Write-up** — the story. What happened? Who came? Any thank-yous?
     Results or totals?
3. Click **Save**. Done — the post is live at `/posts/` in about two minutes.

## Fixing a mistake

- **Edit it again.** Open the post, change what's wrong, Save. That's the
  everyday undo.
- **Hide a post** — flip on "Hide from the site (draft)" and Save. The post
  stays in the system but disappears from the site.
- **Delete a post** — open it and use the delete option in Pages CMS.
- **Something looks really wrong?** Contact the site administrator — every
  change is saved in the site's history and can be rolled back.

## Other things you can edit

- **Scrapbook** — the photo wall at `/scrapbook/`. Add a photo (JPEG, 2 MB max)
  and a one-line caption.

Note: the Scrapbook and Posts keep **separate photo libraries**. A photo you
upload to a post won't show up when adding Scrapbook photos (and vice versa) —
if you want the same photo in both places, upload it in both places.

## Rules of thumb

- Photos: JPEG only, 2 MB max each. If a save fails to appear on the site,
  an oversized or wrong-format file is the most likely reason — re-export it
  and upload again.
- Flyers: PDF only.
- Stick to the forms in Pages CMS; there's no need to touch anything else on
  GitHub itself.

---

## Administrator

- Editor saves are commits straight to `main`; the deploy workflow runs
  `scripts/check_media.sh` before building, so a non-JPEG or >2 MB upload
  fails the deploy instead of publishing (the previous version of the site
  stays up). Check the Actions tab if an editor says their save never appeared.
- Rolling back an editor change: find the commit on GitHub (or `git log`) and
  `git revert <sha> && git push`. Note GitHub's one-click Revert button only
  exists on pull requests, not direct commits, so the revert happens locally.
- The CMS form is defined in `.pages.yml` (collections, fields, media folders,
  allowed extensions).
