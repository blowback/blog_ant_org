#!/bin/sh
set -e
mkdir -p /var/lib/ghost/content/themes
rm -rf /var/lib/ghost/content/themes/source-custom
cp -r /var/lib/ghost/current/content/themes/source-custom \
      /var/lib/ghost/content/themes/source-custom
exec docker-entrypoint.sh "$@"
