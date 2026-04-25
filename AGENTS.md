<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Container Engine

This project supports both Docker and Podman. Use `./scripts/container-engine.sh` as a proxy for all container commands — it detects which engine is available. Never hardcode `docker` or `podman` directly in scripts or commands.
