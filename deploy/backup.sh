#!/usr/bin/env bash
# Daily backup of the blog stack to S3:
#   - MySQL dump (posts, settings, active theme)
#   - ghost_content volume (uploaded images)
#   - remark42_data volume (comments)
# Bundled into one timestamped tar and uploaded. Bucket lifecycle handles expiry.
set -euo pipefail

COMPOSE="docker compose -f /opt/blog/docker-compose.yml"

# DB password, bucket name, and AWS creds come from the stack's .env
set -a
. /opt/blog/.env
set +a

ts="$(date -u +%Y%m%dT%H%M%SZ)"
work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# 1. MySQL — consistent InnoDB snapshot, no table locking
$COMPOSE exec -T mysql \
  mysqldump --single-transaction --quick -uroot -p"$MYSQL_ROOT_PASSWORD" ghost \
  | gzip > "$work/ghost-db.sql.gz"

# 2. Ghost content volume (read-only mount)
docker run --rm -v blog_ghost_content:/data:ro -v "$work":/out alpine \
  tar czf /out/ghost-content.tar.gz -C /data .

# 3. Remark42 data volume
docker run --rm -v blog_remark42_data:/data:ro -v "$work":/out alpine \
  tar czf /out/remark42-data.tar.gz -C /data .

# Bundle (members already compressed -> plain tar)
bundle="blog-backup-$ts.tar"
tar cf "$work/$bundle" -C "$work" ghost-db.sql.gz ghost-content.tar.gz remark42-data.tar.gz

# Ship to S3
aws s3 cp "$work/$bundle" "s3://$BACKUP_BUCKET/$bundle"

echo "$(date -u +%FT%TZ) backup ok: $bundle ($(du -h "$work/$bundle" | cut -f1))"
