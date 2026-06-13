#!/usr/bin/env bash
set -euo pipefail

export PATH="/home/meowlabs/.local/bin:/home/meowlabs/.hermes/node/bin:$PATH"

PROJECT_DIR="/home/meowlabs/atlasproject"
ARTIFACT_PATH="${1:-/tmp/kosatlas-release.tgz}"
TMP_DIR="$(mktemp -d /tmp/kosatlas-deploy.XXXXXX)"
BACKUP_DIR="$(mktemp -d /tmp/kosatlas-backup.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR" "$BACKUP_DIR"
}
trap cleanup EXIT

healthcheck() {
  for attempt in $(seq 1 20); do
    if HEALTH_JSON="$(curl -fsS http://127.0.0.1:3005/api/health 2>/dev/null)"; then
      echo "$HEALTH_JSON"
      return 0
    fi
    sleep 2
  done
  return 1
}

backup_current_release() {
  mkdir -p "$BACKUP_DIR/dist" "$BACKUP_DIR/server" "$BACKUP_DIR/ops"
  [ -d "$PROJECT_DIR/dist" ] && rsync -a "$PROJECT_DIR/dist/" "$BACKUP_DIR/dist/"
  [ -f "$PROJECT_DIR/package.json" ] && cp "$PROJECT_DIR/package.json" "$BACKUP_DIR/package.json"
  [ -f "$PROJECT_DIR/package-lock.json" ] && cp "$PROJECT_DIR/package-lock.json" "$BACKUP_DIR/package-lock.json"
  [ -f "$PROJECT_DIR/server/index.cjs" ] && cp "$PROJECT_DIR/server/index.cjs" "$BACKUP_DIR/server/index.cjs"
  [ -f "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs" ] && cp "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs" "$BACKUP_DIR/ops/pm2.kosatlas.config.cjs"
}

rollback_release() {
  echo "[rollback] Restoring previous KosAtlas release"
  mkdir -p "$PROJECT_DIR/dist" "$PROJECT_DIR/server" "$PROJECT_DIR/ops"
  rsync -a --delete "$BACKUP_DIR/dist/" "$PROJECT_DIR/dist/"
  [ -f "$BACKUP_DIR/package.json" ] && cp "$BACKUP_DIR/package.json" "$PROJECT_DIR/package.json"
  [ -f "$BACKUP_DIR/package-lock.json" ] && cp "$BACKUP_DIR/package-lock.json" "$PROJECT_DIR/package-lock.json"
  [ -f "$BACKUP_DIR/server/index.cjs" ] && cp "$BACKUP_DIR/server/index.cjs" "$PROJECT_DIR/server/index.cjs"
  [ -f "$BACKUP_DIR/ops/pm2.kosatlas.config.cjs" ] && cp "$BACKUP_DIR/ops/pm2.kosatlas.config.cjs" "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs"
  cd "$PROJECT_DIR"
  npm ci --omit=dev
  pm2 startOrReload "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs" --env production
  pm2 save >/dev/null
  echo "[rollback] Health check"
  if ! healthcheck; then
    echo "[rollback] Failed to recover previous release" >&2
    exit 17
  fi
}

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "Artifact not found: $ARTIFACT_PATH" >&2
  exit 1
fi

echo "[1/6] Extract artifact"
tar -xzf "$ARTIFACT_PATH" -C "$TMP_DIR"

backup_current_release

echo "[2/6] Sync release files"
mkdir -p "$PROJECT_DIR/dist" "$PROJECT_DIR/server" "$PROJECT_DIR/ops" "$PROJECT_DIR/logs"
rsync -a --delete "$TMP_DIR/dist/" "$PROJECT_DIR/dist/"
install -m 0644 "$TMP_DIR/package.json" "$PROJECT_DIR/package.json"
install -m 0644 "$TMP_DIR/package-lock.json" "$PROJECT_DIR/package-lock.json"
install -m 0644 "$TMP_DIR/server/index.cjs" "$PROJECT_DIR/server/index.cjs"
install -m 0644 "$TMP_DIR/ops/pm2.kosatlas.config.cjs" "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs"

echo "[3/6] Install production dependencies"
cd "$PROJECT_DIR"
npm ci --omit=dev

echo "[4/6] Reload PM2"
pm2 startOrReload "$PROJECT_DIR/ops/pm2.kosatlas.config.cjs" --env production
pm2 save >/dev/null

echo "[5/6] Health check"
if ! healthcheck; then
  echo "Health check failed, starting rollback" >&2
  rollback_release
fi

echo "[6/6] Done"
rm -f "$ARTIFACT_PATH"
