// ---------------------------------------------------------------------------
// Auto-shrink oversized editor photos so the deploy never fails on size.
//
// Pages CMS validates only a file's EXTENSION, not its size, so an editor can
// commit a full-resolution phone photo straight to main. Run by the deploy
// workflow BEFORE the media check and the Hugo build: any JPEG over the cap in
// the photo directories is re-encoded to fit within DIM px and under MAX bytes,
// in place. Hugo then generates its display derivatives (.Fill/.Fit) from the
// smaller original and scripts/check_media.sh passes on size.
//
// It does NOT commit the shrunk file back — it only fixes the CI working copy so
// the deploy succeeds. Bash/Node only (no Python), per project rules.
// ---------------------------------------------------------------------------
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
// Photo dirs guarded by scripts/check_media.sh (2 MB JPEG cap). Flyers are PDFs,
// so they are left to the media check.
const DIRS = ['assets/images/posts', 'static/images/scrapbook'];
const MAX = 2 * 1024 * 1024; // 2 MB, matching scripts/check_media.sh
const DIM = 2000;            // max width/height; the lightbox only needs Fit 1600
const QUALITIES = [82, 75, 68, 60];

// Recursively collect JPEGs under a repo-relative directory.
function jpegsIn(dir) {
  let entries;
  try {
    entries = readdirSync(join(ROOT, dir), { withFileTypes: true });
  } catch {
    return []; // directory may not exist yet
  }
  const files = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    if (e.isDirectory()) files.push(...jpegsIn(join(dir, e.name)));
    else if (/\.jpe?g$/i.test(e.name)) files.push(join(dir, e.name));
  }
  return files;
}

// Re-encode one oversized JPEG in place. Returns {before, after} or null if the
// file was already within the cap.
async function shrink(rel) {
  const abs = join(ROOT, rel);
  const before = statSync(abs).size;
  if (before <= MAX) return null;
  // .rotate() with no argument auto-orients from the EXIF Orientation tag. sharp
  // strips metadata by default, so orientation MUST be baked into the pixels
  // first or phone photos come out sideways (this also drops GPS EXIF — a
  // privacy win). Step the quality down until the result fits under the cap.
  let out;
  for (const quality of QUALITIES) {
    out = await sharp(abs)
      .rotate()
      .resize({ width: DIM, height: DIM, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality, mozjpeg: true })
      .toBuffer();
    if (out.length <= MAX) break;
  }
  writeFileSync(abs, out);
  return { before, after: out.length };
}

const kb = (n) => Math.round(n / 1024);
let resized = 0;
let failed = 0;
for (const dir of DIRS) {
  for (const rel of jpegsIn(dir)) {
    try {
      const r = await shrink(rel);
      if (r) {
        resized++;
        console.log(`resized ${rel}: ${kb(r.before)} KB -> ${kb(r.after)} KB`);
      }
    } catch (err) {
      // Don't abort the run on one bad file; let check_media.sh flag it (e.g. a
      // non-JPEG saved with a .jpg extension).
      failed++;
      console.error(`skip ${rel}: ${err.message}`);
    }
  }
}
console.log(resized ? `Resized ${resized} oversized photo(s).` : 'No oversized photos found.');
if (failed) console.log(`${failed} file(s) could not be processed (left for check_media.sh).`);
