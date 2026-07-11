#!/usr/bin/env bash
# Guard rails for editor-uploaded media, run by the deploy workflow (and
# runnable locally). Belt-and-suspenders behind the Pages CMS config, which
# restricts extensions but cannot enforce file sizes:
#   - gallery photos (assets/images/news/, static/images/scrapbook/):
#     real JPEGs only, 2 MB max each
#   - flyers (static/files/flyers/): real PDFs only, 10 MB max each
# Exits non-zero (failing the deploy) if any file breaks the rules.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
fail=0

# magic_ok <file> <type>: check the file really is what its extension claims.
magic_ok() {
  case "$2" in
    jpeg) [ "$(od -An -tx1 -N3 "$1" | tr -d ' \n')" = "ffd8ff" ] ;;
    pdf)  [ "$(head -c 4 "$1")" = "%PDF" ] ;;
  esac
}

# check_dir <dir> <allowed-extensions> <type> <max-bytes> <max-label>
check_dir() {
  local dir="$1" exts="$2" type="$3" max="$4" max_label="$5" f rel ext size
  [ -d "$ROOT/$dir" ] || return 0
  while IFS= read -r -d '' f; do
    rel="${f#"$ROOT"/}"
    ext="$(printf '%s' "${f##*.}" | tr '[:upper:]' '[:lower:]')"
    case " $exts " in
      *" $ext "*)
        if ! magic_ok "$f" "$type"; then
          echo "FAIL: $rel is not a real ${type} file (bad file contents)"
          fail=1
        fi
        ;;
      *)
        echo "FAIL: $rel — only ${exts// /\/} files are allowed in $dir"
        fail=1
        ;;
    esac
    size=$(wc -c < "$f")
    if [ "$size" -gt "$max" ]; then
      echo "FAIL: $rel is $((size / 1024)) KB — the limit is $max_label"
      fail=1
    fi
  done < <(find "$ROOT/$dir" -type f ! -name '.*' -print0)
}

check_dir "assets/images/news"      "jpg jpeg" jpeg $((2 * 1024 * 1024))  "2 MB"
check_dir "static/images/scrapbook" "jpg jpeg" jpeg $((2 * 1024 * 1024))  "2 MB"
check_dir "static/files/flyers"     "pdf"      pdf  $((10 * 1024 * 1024)) "10 MB"

if [ "$fail" -ne 0 ]; then
  echo
  echo "Media check failed. Photos must be JPEG under 2 MB; flyers must be PDF under 10 MB."
  echo "Re-export the file (phone/Google Photos \"Large\" size is ideal) and upload again."
  exit 1
fi
echo "Media check passed."
