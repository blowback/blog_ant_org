#!/usr/bin/env bash
set -euo pipefail

# Run from inside content/themes/your-theme/assets/fonts/
SANS_VER="5.2.8"
MONO_VER="5.2.7"
SANS="https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-sans@${SANS_VER}/files"
MONO="https://cdn.jsdelivr.net/npm/@fontsource/ibm-plex-mono@${MONO_VER}/files"

# source-url  ->  local-name (matches the @font-face src paths)
fetch() { echo "  $2"; curl -fsSL "$1" -o "$2"; }

echo "Fetching IBM Plex Sans…"
fetch "$SANS/ibm-plex-sans-latin-400-normal.woff2"  "ibm-plex-sans-400.woff2"
fetch "$SANS/ibm-plex-sans-latin-500-normal.woff2"  "ibm-plex-sans-500.woff2"
fetch "$SANS/ibm-plex-sans-latin-700-normal.woff2"  "ibm-plex-sans-700.woff2"
fetch "$SANS/ibm-plex-sans-latin-400-italic.woff2"  "ibm-plex-sans-400-italic.woff2"

echo "Fetching IBM Plex Mono…"
fetch "$MONO/ibm-plex-mono-latin-400-normal.woff2"  "ibm-plex-mono-400.woff2"
fetch "$MONO/ibm-plex-mono-latin-500-normal.woff2"  "ibm-plex-mono-500.woff2"

echo "Done. Now drop your bariol-regular.woff2 / bariol-bold.woff2 in here too."
ls -lh *.woff2
