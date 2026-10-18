# lift-rest-push
Cloudflare Worker + SQLite Durable Object (one per device). `POST /schedule {id, sub, at}` sets a DO alarm;
at rest end the alarm sends an encrypted (aes128gcm) VAPID Web Push. `POST /cancel {id}` deletes the alarm.
Free plan: 100k requests/day; each rest ≈ 2–3 requests. VAPID private key lives only in `.dev.vars` (gitignored) and as a Worker secret.
Tests: `node test_webpush.mjs`. Local: `npx wrangler dev` (add `TEST_ENDPOINT_PREFIX=http://localhost:9999` to .dev.vars for a mock push service).
Deploy: `./deploy.sh` (after `npx wrangler login` or with CLOUDFLARE_API_TOKEN).
