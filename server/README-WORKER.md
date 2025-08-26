Worker automation for resumen_rutas

What I added:
- scripts/worker-runner.sh : a simple loop that runs `node scripts/resumen-worker.js` (delta) every WORKER_INTERVAL seconds (default 300s).
- docker-compose service `resumen_worker` that runs the runner in a container using the server image.
- Admin endpoint POST /api/reportes/admin/resumen/full (requires ADMIN role) that triggers a full rebuild via child_process.

How to run locally (dev):
- Run the runner directly (dev):

  cd server
  pnpm run resumen:runner

How to run in docker-compose:
- The new service `resumen_worker` will run automatically when you `docker-compose up -d`.
- Control interval by setting WORKER_INTERVAL environment variable (seconds) in your .env or compose override.

Triggering a full rebuild manually:
- From an admin account, call POST /api/reportes/admin/resumen/full (Authorization: Bearer <token>)
- Or inside the server container run: pnpm run resumen:full

Notes:
- The runner is intentionally simple. For production-grade scheduling use a system cron, Kubernetes CronJob or a job queue with retries and observability.
- The admin endpoint spawns the worker process asynchronously. Check server logs for worker output.
