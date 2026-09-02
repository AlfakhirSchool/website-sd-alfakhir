# student-api

Self-hosted store for student registration data (PII), meant to run on the
school's own Proxmox server instead of a public-read Sanity dataset. Only
the Next.js backend (Vercel) talks to this — never the browser.

## Run it

```bash
cp .env.example .env
# fill STUDENT_API_KEY, e.g.: openssl rand -hex 32 >> .env  (then edit format)
docker compose up -d --build
curl http://localhost:4001/health   # -> {"ok":true}
```

Data persists in `./data/students.db` (SQLite) — back this file up.

## Expose it to the internet (required — Vercel needs to reach it over HTTPS)

The Vercel-hosted frontend can't reach a bare Proxmox LAN IP. Put a reverse
proxy with a real TLS certificate in front of port 4001, on a subdomain,
e.g. `student-api.yourdomain.id`. Simplest option, [Caddy](https://caddyserver.com/)
(auto-HTTPS, one file):

```
# /etc/caddy/Caddyfile
student-api.yourdomain.id {
    reverse_proxy localhost:4001
}
```

Then `systemctl reload caddy`. Point a DNS A record at the server's public
IP first. Firewall the box so port 4001 itself isn't reachable directly —
only Caddy (443) should be exposed.

## Wire up the frontend

In `frontend/.env` (Vercel env vars in production):

```
STUDENT_API_URL=https://student-api.yourdomain.id
STUDENT_API_KEY=<same value as this service's .env>
```
