#!/usr/bin/env sh
# Container engine proxy — uses docker if available, falls back to podman.
# Usage: ./scripts/container-engine.sh build -t awesome-todo .
#        ./scripts/container-engine.sh run --rm -p 3000:3000 awesome-todo

if command -v docker >/dev/null 2>&1; then
  exec docker "$@"
elif command -v podman >/dev/null 2>&1; then
  exec podman "$@"
else
  echo "Error: neither docker nor podman found. Install one of them to continue." >&2
  exit 1
fi
