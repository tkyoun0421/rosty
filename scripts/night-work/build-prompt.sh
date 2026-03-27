#!/bin/sh

set -eu

SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
REPO_ROOT=$(CDPATH= cd -- "$SCRIPT_DIR/../.." && pwd)

if [ "$#" -eq 0 ]; then
  echo "Usage: ./scripts/night-work/build-prompt.sh \"<goal>\"" >&2
  exit 1
fi

cd "$REPO_ROOT"
node "$SCRIPT_DIR/buildPrompt.mjs" "$@"
