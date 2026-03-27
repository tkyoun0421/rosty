#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
STATE_DIR="$REPO_ROOT/tmp/night-work"
PID_FILE="$STATE_DIR/runner.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "night-work runner is not running"
  exit 0
fi

PID=$(cat "$PID_FILE")

if kill -0 "$PID" 2>/dev/null; then
  kill "$PID"
  echo "stopped night-work runner pid $PID"
else
  echo "night-work runner pid file was stale"
fi

rm -f "$PID_FILE"
