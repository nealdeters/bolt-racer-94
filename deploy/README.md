# Bolt Racer #94 — Framework deploy

- **Container:** `bolt-racer-94`
- **Listen:** `127.0.0.1:5194` (Docker / nginx)
- **Dev preview (optional vite):** `http://127.0.0.1:5174`

## Run

```bash
cd /home/nealdeters/code/bolt-racer-94
docker compose up -d --build
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:5194/
```

Mesh credit: RigModels (Royalty Free) — see footer / README.
