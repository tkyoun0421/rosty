#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
STATE_DIR="$REPO_ROOT/tmp/night-work"

if [ "$#" -eq 0 ]; then
  echo "Usage: ./scripts/night-work/run.sh \"<goal>\"" >&2
  exit 1
fi

mkdir -p "$STATE_DIR"

nohup node "$SCRIPT_DIR/run.mjs" "$@" >>"$STATE_DIR/runner.log" 2>&1 &

echo "night-work runner started"
echo "goal: $*"
echo "logs: $STATE_DIR"
