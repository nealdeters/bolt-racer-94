# Bolt Racer #94 — Framework deploy

- **Container:** `bolt-racer-94`
- **Local port (for Cloudflare tunnel):** `127.0.0.1:5194`
- **LAN preview (dev vite, separate):** `http://192.168.1.125:5174`

## Run

```bash
cd /home/nealdeters/code/bolt-racer-94
docker compose up -d --build
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5194/
```

## Cloudflare

1. Add DNS for `bolt.nealdeters.com` (or your name) → Cloudflare Tunnel.
2. Merge `cloudflare-ingress.snippet.yml` into `~/.cloudflared/config.yml` ingress (above the 404 rule).
3. Restart the tunnel service.

Mesh credit: RigModels (Royalty Free) — see footer / README.
