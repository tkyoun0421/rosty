#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)
STATE_DIR="$REPO_ROOT/tmp/night-work"
PID_FILE="$STATE_DIR/runner.pid"
STATUS_FILE="$STATE_DIR/latest.status"

if [ -f "$PID_FILE" ]; then
  PID=$(cat "$PID_FILE")
  if kill -0 "$PID" 2>/dev/null; then
    echo "NIGHT_WORK_RUNNER_STATE: RUNNING"
    [ -f "$STATUS_FILE" ] && cat "$STATUS_FILE"
    exit 0
  fi
fi

if [ -f "$STATUS_FILE" ]; then
  echo "NIGHT_WORK_RUNNER_STATE: STOPPED"
  cat "$STATUS_FILE"
  exit 0
fi

echo "NIGHT_WORK_RUNNER_STATE: STOPPED"
echo "NIGHT_WORK_STATUS: UNKNOWN"
echo "NIGHT_WORK_REASON: no_run_history"
