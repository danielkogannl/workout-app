#!/usr/bin/env bash
# Deploy the rest-alert push worker (free Cloudflare Workers plan) and point the app at it.
# Needs: `npx wrangler login` done once, OR env CLOUDFLARE_API_TOKEN (template "Edit Cloudflare Workers").
set -euo pipefail
cd "$(dirname "$0")"
npx wrangler whoami
grep '^VAPID_PRIVATE_KEY=' .dev.vars | cut -d= -f2 | npx wrangler secret put VAPID_PRIVATE_KEY
URL=$(npx wrangler deploy 2>&1 | tee /dev/stderr | grep -o 'https://[a-z0-9.-]*workers\.dev' | head -1)
[ -n "$URL" ] || { echo "Could not detect worker URL"; exit 1; }
curl -fsS "$URL/" && echo
sed -i "s#url:'[^']*'#url:'$URL'#" ../config.js
echo "Worker live at $URL; config.js updated. Bump sw.js cache, commit and push."
