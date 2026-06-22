#!/bin/sh
set -e
mkdir -p /var/lib/ghost/content/themes
rm -rf /var/lib/ghost/content/themes/source-custom
cp -r /var/lib/ghost/current/content/themes/source-custom \
      /var/lib/ghost/content/themes/source-custom
# Make the repo's routes.yaml authoritative: copy it into the content volume on
# every boot (mirrors the theme copy above). Edit routes.yaml in the repo and
# redeploy — changes made via Admin → Labs → Routes will be overwritten here.
mkdir -p /var/lib/ghost/content/settings
cp /var/lib/ghost/current/content/settings/routes.yaml \
   /var/lib/ghost/content/settings/routes.yaml
exec docker-entrypoint.sh "$@"
