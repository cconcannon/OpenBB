#!/usr/bin/env bash
# Start the OpenBB API server and the webapp dev server together.
# Ctrl-C stops both.
set -euo pipefail
cd "$(dirname "$0")"

API_HOST="${API_HOST:-127.0.0.1}"
API_PORT="${API_PORT:-6900}"

if [[ ! -x .venv/bin/openbb-api ]]; then
  echo "error: .venv/bin/openbb-api not found." >&2
  echo "       See webapp/README.md → 'First-time backend setup'." >&2
  exit 1
fi

if [[ ! -d webapp/node_modules ]]; then
  echo "info: webapp/node_modules missing — running npm install..."
  (cd webapp && npm install)
fi

set -m
cleanup() {
  trap - INT TERM EXIT
  for pgid in $(jobs -p); do kill -- -"$pgid" 2>/dev/null || true; done
  wait 2>/dev/null || true
}
trap cleanup INT TERM EXIT

prefix() { while IFS= read -r line; do printf '\033[2m[%s]\033[0m %s\n' "$1" "$line"; done; }

echo "→ API server  : http://${API_HOST}:${API_PORT}"
echo "→ Webapp      : http://localhost:1471"
echo

.venv/bin/openbb-api --host "$API_HOST" --port "$API_PORT" 2>&1 | prefix api &
(cd webapp && exec npm run dev) 2>&1 | prefix web &

wait -n
exit $?
