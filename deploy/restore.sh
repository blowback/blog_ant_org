#!/usr/bin/env bash
# Restore the blog from an S3 backup.
#
# Usage:
#   restore.sh                         # restore the LATEST backup (with prompt)
#   restore.sh -y                      # latest, no confirmation prompt
#   restore.sh blog-backup-….tar       # restore a specific backup
#   restore.sh -y blog-backup-….tar    # specific, no prompt
#   restore.sh -l                      # just list available backups and exit
#
# Destructive: overwrites the current database and content/comment volumes.
set -euo pipefail

COMPOSE="docker compose -f /opt/blog/docker-compose.yml"

# aws-cli via container. $AWS for plain calls; aws_cp() for calls needing a mount.
AWS="docker run --rm -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION amazon/aws-cli"
aws_cp() { # aws_cp <host-dir> <s3-args...>
  local hostdir="$1"; shift
  docker run --rm \
    -e AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY -e AWS_DEFAULT_REGION \
    -v "$hostdir":/work amazon/aws-cli "$@"
}

# Load bucket name, DB password, AWS creds
set -a
. /opt/blog/.env
set +a

assume_yes=false
list_only=false
backup=""

for arg in "$@"; do
  case "$arg" in
    -y|--yes) assume_yes=true ;;
    -l|--list) list_only=true ;;
    -*) echo "unknown option: $arg" >&2; exit 2 ;;
    *) backup="$arg" ;;
  esac
done

list_backups() {
  $AWS s3 ls "s3://$BACKUP_BUCKET/" | awk '{print $4}' | grep '^blog-backup-.*\.tar$' | sort
}

if $list_only; then
  echo "Backups in s3://$BACKUP_BUCKET/ :"
  list_backups
  exit 0
fi

# Resolve which backup to restore
if [ -z "$backup" ]; then
  backup="$(list_backups | tail -1)"
  if [ -z "$backup" ]; then
    echo "No backups found in s3://$BACKUP_BUCKET/" >&2
    exit 1
  fi
  echo "Latest backup: $backup"
fi

# Confirm (read from the terminal even if stdin is piped)
if ! $assume_yes; then
  echo
  echo "About to restore: $backup"
  echo "This will OVERWRITE the current database, uploaded images, and comments."
  printf "Type 'yes' to continue: "
  read -r ans < /dev/tty
  [ "$ans" = "yes" ] || { echo "Aborted."; exit 1; }
fi

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

echo "==> Downloading $backup"
aws_cp "$work" s3 cp "s3://$BACKUP_BUCKET/$backup" "/work/$backup"
tar xf "$work/$backup" -C "$work"

echo "==> Stopping app containers (mysql stays up)"
$COMPOSE stop ghost remark42

echo "==> Restoring MySQL"
gunzip -c "$work/ghost-db.sql.gz" | \
  $COMPOSE exec -T mysql mysql -uroot -p"$MYSQL_ROOT_PASSWORD" ghost

echo "==> Restoring ghost_content volume"
docker run --rm -v blog_ghost_content:/data -v "$work":/in alpine \
  sh -c 'rm -rf /data/* && tar xzf /in/ghost-content.tar.gz -C /data'

echo "==> Restoring remark42_data volume"
docker run --rm -v blog_remark42_data:/data -v "$work":/in alpine \
  sh -c 'rm -rf /data/* && tar xzf /in/remark42-data.tar.gz -C /data'

echo "==> Starting app containers"
$COMPOSE up -d ghost remark42

echo "Restore complete from $backup"
echo "Check: posts/images present, comments present, source-custom theme active."
