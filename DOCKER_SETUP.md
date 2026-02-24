# Docker Compose Setup - Quick Start

## Files Created

1. **docker-compose.yml** — Orchestrates three services: MongoDB, Node.js API server, and React client
2. **client/Dockerfile** — Multi-stage build: Node.js build stage → nginx runtime serving React build
3. **client/nginx.conf** — nginx config: serves React app on port 3000, proxies /api and /socket.io to server
4. **server/Dockerfile** — Node.js image running Express API with health check
5. **client/.dockerignore** — Excludes unnecessary files from client build context
6. **server/.dockerignore** — Excludes unnecessary files from server build context
7. **.env.example** — Template for environment variables
8. **client/public/index.html** — React entry point (auto-generated)

## How to Run

**From repo root:**

```bash
docker compose up -d
```

Services will start in order:
1. **MongoDB** (mongo:7) — waits for healthy status
2. **Server** (Node.js) — depends on MongoDB, waits for healthy status
3. **Client** (nginx) — depends on Server, waits for healthy status

All services communicate via the `referral_network` bridge network.

## Accessing the App

- **Client (React)**: http://localhost:3000
- **Server (API)**: http://localhost:5000
- **MongoDB**: localhost:27017 (exposed on host for debugging)

## Environment Variables

Create a `.env` file at repo root (optional):

```bash
JWT_SECRET=your-actual-secret-here
```

If `.env` doesn't exist, defaults are used (JWT_SECRET defaults to `your-secret-key-change-this-in-production`).

## Architecture

- **mongo** — Official MongoDB 7 image with named volumes for persistence
- **server** — Builds from `./server/Dockerfile`, listens on `0.0.0.0:5000` (all interfaces)
- **client** — Builds from `./client/Dockerfile`, nginx serves React build on port 3000

The client's nginx config automatically:
- Routes `/api/*` to `http://server:5000` (container hostname)
- Routes `/socket.io/*` to `http://server:5000` for real-time chat
- Serves React static files with proper caching headers

## Important Notes

- **server/index.js** was updated to always listen when `NODE_ENV=production` (Docker default)
- Health checks use Node.js HTTP instead of curl (not installed in alpine image)
- Both Dockerfiles use `npm install` instead of `npm ci` for flexibility with lock file mismatches
- Client build output is copied to nginx container in second stage (reduced final image size)
- Named volumes (`mongo_data`, `mongo_config`) persist MongoDB data across restarts

## Troubleshooting

If port 5000 is already in use on your host machine, either:
1. Kill the process: `lsof -i :5000 | awk 'NR>1 {print $2}' | xargs kill -9`
2. Or, change the port mapping in `docker-compose.yml`: `ports: ["5001:5000"]`

Check service status:
```bash
docker compose ps
docker compose logs server
docker compose logs mongo
docker compose logs client
```

Clean everything:
```bash
docker compose down -v
```
