#!/usr/bin/env bash
#
# Local database backup for Sameday Express (web/).
#
# Dumps the database from DATABASE_URL (web/.env / .env.local) into a
# timestamped custom-format file under web/backups/. Restore with:
#
#   pg_restore --no-owner --no-privileges -d "$DATABASE_URL" <file>.dump
#
# Requires pg_dump on PATH (PostgreSQL client tools installed locally).
#
# Usage:
#   bash scripts/backup-db.sh              # uses DATABASE_URL from .env/.env.local
#   DATABASE_URL=... bash scripts/backup-db.sh

set -euo pipefail

cd "$(dirname "$0")/.."

# ── Resolve DATABASE_URL from the first env file that defines it ──────────
if [ -z "${DATABASE_URL:-}" ]; then
  for envfile in .env.local .env; do
    if [ -f "$envfile" ] && grep -q '^DATABASE_URL=' "$envfile"; then
      # Extract with sed (not `source`) — the value may be unquoted and
      # contain characters (& ? =) that would break shell parsing.
      DATABASE_URL=$(sed -n 's/^DATABASE_URL=//p' "$envfile" | head -n1)
      # Strip optional surrounding quotes
      DATABASE_URL=${DATABASE_URL#\"}; DATABASE_URL=${DATABASE_URL%\"}
      export DATABASE_URL
      break
    fi
  done
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not found in environment or .env/.env.local" >&2
  exit 1
fi

command -v pg_dump >/dev/null || {
  echo "ERROR: pg_dump not found. Install PostgreSQL client tools first." >&2
  exit 1
}

OUT_DIR="backups"
mkdir -p "$OUT_DIR"
TIMESTAMP=$(date -u +%Y%m%d-%H%M%S)
OUT="$OUT_DIR/backup-$TIMESTAMP.dump"

pg_dump --no-owner --no-privileges -Fc "$DATABASE_URL" -f "$OUT"

SIZE=$(du -h "$OUT" | cut -f1)
echo "Backup written: $OUT ($SIZE)"

# Prune: keep only the newest 12 local backups (~3 months if weekly)
ls -1t "$OUT_DIR"/backup-*.dump 2>/dev/null | tail -n +13 | while read -r old; do
  echo "Pruning old backup: $old"
  rm -- "$old"
done

echo "Done. Restore with:"
echo "  pg_restore --no-owner --no-privileges -d \"\$DATABASE_URL\" $OUT"
