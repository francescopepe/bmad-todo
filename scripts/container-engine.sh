#!/usr/bin/env sh
# Container engine proxy — uses docker if available, falls back to podman.
# Usage: ./scripts/container-engine.sh build -t awesome-todo .
#        ./scripts/container-engine.sh run --rm -p 3000:3000 awesome-todo

# Resolve podman — check PATH first, then common install locations
resolve_podman() {
  if command -v podman >/dev/null 2>&1; then
    echo "podman"
  elif [ -x /opt/podman/bin/podman ]; then
    echo "/opt/podman/bin/podman"
  elif [ -x /opt/homebrew/bin/podman ]; then
    echo "/opt/homebrew/bin/podman"
  elif [ -x /usr/local/bin/podman ]; then
    echo "/usr/local/bin/podman"
  else
    return 1
  fi
}

# Prefer docker if its daemon is reachable
if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  exec docker "$@"
fi

# Fall back to podman
PODMAN=$(resolve_podman) && exec "$PODMAN" "$@"

echo "Error: neither docker (running) nor podman found. Install one of them to continue." >&2
exit 1
