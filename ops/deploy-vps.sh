#!/usr/bin/env bash
set -euo pipefail

export PATH="/home/meowlabs/.local/bin:/home/meowlabs/.hermes/node/bin:$PATH"

PROJECT_DIR="/home/meowlabs/atlasproject"
ARTIFACT_PATH="${1:-/tmp/kosatlas-release.tgz}"
TMP_DIR="$(mktemp -d /tmp/kosatlas-deploy.XXXXXX)"

cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

if [ ! -f "$ARTIFACT_PATH" ]; then
  echo "Artifact not found: $ARTIFACT_PATH" >&2
  exit 1
fi

echo "[1/6] Extract artifact"
tar -xzf "$ARTIFACT_PATH" -C "$TMP_DIR"

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
for attempt in $(seq 1 20); do
  if HEALTH_JSON="$(curl -fsS http://127.0.0.1:3005/api/health 2>/dev/null)"; then
    echo "$HEALTH_JSON"
    break
  fi
  if [ "$attempt" -eq 20 ]; then
    echo "Health check failed after $attempt attempts" >&2
    exit 7
  fi
  sleep 2
done

echo "[6/6] Done"
rm -f "$ARTIFACT_PATH"
