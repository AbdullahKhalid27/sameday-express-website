# Backups & CI

## CI (`.github/workflows/ci.yml`)

Runs on every push to `main` and every PR:

1. `npm ci`
2. `prisma generate`
3. `next build` (this is the type-check — no `DATABASE_URL` needed; server
   clients stub themselves during build phase)

A red ✗ on a PR means the build is broken — fix before merging.

## Weekly automated backup (`.github/workflows/db-backup.yml`)

Runs every **Monday 03:00 UTC** (and manually via the Actions tab →
"Database Backup" → Run workflow). Does `pg_dump -Fc` against the
production database and stores it as a private workflow artifact
(90-day retention).

### One-time setup

1. Get the **production** connection string (from Neon/Render/Vercel —
   wherever the live DB lives).
2. GitHub repo → **Settings → Secrets and variables → Actions →
   New repository secret**:
   - Name: `BACKUP_DATABASE_URL`
   - Value: the full connection string (`postgresql://...?sslmode=require`)
3. Done. Verify by triggering a manual run once and checking the artifact
   downloads and is > 1KB.

### Restoring

```bash
# 1. Download the artifact from the workflow run page and unzip it
pg_restore --no-owner --no-privileges -d "$DATABASE_URL" backup-YYYYMMDD-HHMMSS.dump
```

Test a restore at least once — an untested backup is a hope, not a backup.

### Notes & limits

- This backs up the DB only. Code is in git; env vars live in Vercel —
  keep a copy of the Vercel env list somewhere safe (password manager).
- Artifacts cap at GitHub's quota (large on free plans is fine for this
  schema). If dumps outgrow artifacts, add an S3/R2 upload step.
- **Neon users:** Neon has its own point-in-time restore (2 days of
  history on free tier, longer on paid). This workflow is the belt to
  that braces — independent of the provider.
- The workflow intentionally **fails** if the dump is under 1KB so a
  silent failure never looks like success.

## Local ad-hoc backup (`web/scripts/backup-db.sh`)

```bash
cd web
bash scripts/backup-db.sh
```

Dumps whatever `DATABASE_URL` is in `.env.local`/`.env` into
`web/backups/`, keeping the newest 12. Useful before schema experiments:
`prisma migrate reset` destroys local data — take a backup first.
