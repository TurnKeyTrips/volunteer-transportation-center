#!/usr/bin/env bash
# Generate LINKS.md — an inventory of every link found in content/**/*.md.
# Usage: ./scripts/gen_links.sh   (run from anywhere; writes LINKS.md at repo root)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTENT="$ROOT/content"
OLD_MEDIA="$ROOT/_old_site_files/WEBSITE-CONTENT"
OUT="$ROOT/LINKS.md"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

# Extract "url<TAB>file" pairs from markdown links [text](url) and raw href="..."/src="..."
while IFS= read -r -d '' f; do
  rel="${f#"$ROOT"/}"
  {
    grep -oE '\]\([^)  ]+' "$f" | sed 's/^](//' || true
    grep -oE '(href|src)="[^"]+"' "$f" | sed -E 's/^(href|src)="//; s/"$//' || true
  } | while IFS= read -r url; do
    printf '%s\t%s\n' "$url" "$rel"
  done
done < <(find "$CONTENT" -name '*.md' -print0 | sort -z) | sort -u > "$TMP"

# Classify and render grouped markdown tables with awk
awk -F'\t' '
function classify(u,  lu) {
  lu = tolower(u)
  if (lu ~ /^mailto:/) return "mailto"
  if (lu ~ /^tel:/) return "tel"
  if (lu ~ /wp-content\/uploads/ || lu ~ /\/wp\//) return "media"
  if (lu ~ /^#/) return "anchor"
  if (lu ~ /^https?:\/\//) {
    if (lu ~ /volunteertransportationcenter\.org/) return "internal-absolute"
    return "external"
  }
  return "internal"
}
{
  cls = classify($1)
  key = cls SUBSEP $1
  if (key in sources) sources[key] = sources[key] "<br>`" $2 "`"
  else { sources[key] = "`" $2 "`"; order[cls] = order[cls] ? order[cls] "\n" $1 : $1; count[cls]++ }
  total++
}
function section(title, cls, note,  n, i, urls, u) {
  printf "## %s (%d)\n\n", title, count[cls] + 0
  if (note != "") printf "%s\n\n", note
  if (count[cls] + 0 == 0) { printf "_None found._\n\n"; return }
  print "| Link | Found in |"
  print "| --- | --- |"
  n = split(order[cls], urls, "\n")
  for (i = 1; i <= n; i++) {
    u = urls[i]
    gsub(/\|/, "%7C", u)
    printf "| `%s` | %s |\n", u, sources[cls SUBSEP urls[i]]
  }
  print ""
}
END {
  print "# Link Inventory\n"
  print "Auto-generated log of every link found in `content/**/*.md` (markdown links and raw `href`/`src` attributes)."
  print "Regenerate with `./scripts/gen_links.sh` after content changes.\n"
  printf "**Total unique links: %d**\n\n", total
  section("Internal links (relative)", "internal", \
    "Links within the site. Verify each resolves to a page in `content/` or a planned redirect.")
  section("Internal links (absolute old-domain URLs)", "internal-absolute", \
    "Absolute URLs pointing at the old production domain — these should be converted to relative paths.")
  section("Old WordPress media references", "media", \
    "References to `wp-content/uploads` files. The physical files live in `_old_site_files/WEBSITE-CONTENT/` (organized by year). These need a migration pass: copy the needed files into `static/` (or page bundles) and rewrite the paths.")
  section("External links", "external", \
    "Third-party destinations. Spot-check these are still live before launch.")
  section("Email links", "mailto", "")
  section("Phone links", "tel", "")
  section("In-page anchors", "anchor", "")
}
' "$TMP" > "$OUT"

# Old media archive summary (file names/counts only — never read contents)
{
  echo "## Old media archive summary"
  echo
  echo '`_old_site_files/WEBSITE-CONTENT/` — WordPress uploads organized by year. Counts only; files not yet migrated.'
  echo
  echo "| Year | Files |"
  echo "| --- | --- |"
  grand=0
  for d in "$OLD_MEDIA"/*/; do
    [ -d "$d" ] || continue
    n=$(find "$d" -type f | wc -l | tr -d ' ')
    grand=$((grand + n))
    echo "| $(basename "$d") | $n |"
  done
  echo "| **Total** | **$grand** |"
} >> "$OUT"

echo "Wrote $OUT — $(wc -l < "$TMP" | tr -d ' ') url/file pairs"
