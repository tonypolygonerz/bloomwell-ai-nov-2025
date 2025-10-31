# Bloomwell AI Deployment

## Railway (PostgreSQL)
1. Create project & Postgres
2. Copy `DATABASE_URL` from Railway Variables (use TCP proxy domain/port)
3. Save as secret in:
   - GitHub → Settings → Secrets → Actions → `DATABASE_URL`
   - Cloudflare Pages projects (`bloomwell-ai-web`, `bloomwell-ai-admin`)

## Cloudflare Pages (2 projects)
- Project 1: `bloomwell-ai-web` → custom domain: `bloomwell-ai.com`
- Project 2: `bloomwell-ai-admin` → custom domain: `admin.bloomwell-ai.com`
- Framework preset: Next.js, Node 18
- Env vars (Production & Preview):
  - `DATABASE_URL`
  - `NEXTAUTH_URL=https://bloomwell-ai.com`
  - `NEXTAUTH_SECRET` (openssl rand -base64 48)
  - `OLLAMA_CLOUD_API_KEY`, `STRIPE_SECRET_KEY` and others as needed

## Database migrations
- GitHub Actions workflow `db-migrate.yml` runs `npx prisma migrate deploy` on pushes to `main` using `DATABASE_URL` secret.
