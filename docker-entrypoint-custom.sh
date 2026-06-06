#!/bin/sh
set -e
# Ghost symlinks only its built-in themes into the content volume; add ours.
mkdir -p /var/lib/ghost/content/themes
ln -sf /var/lib/ghost/current/content/themes/source-custom \
       /var/lib/ghost/content/themes/source-custom
exec docker-entrypoint.sh "$@"
