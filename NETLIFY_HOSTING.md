# Netlify Deployment Guide

This guide covers deploying the **Su-Ling Esports** Next.js application to Netlify using **Supabase PostgreSQL**.

---

## ⚠️ Important: Database Requirement

This project uses **Prisma + PostgreSQL**.

**Do NOT use SQLite on Netlify** — Netlify Functions are serverless and stateless, so local file writes are lost when the function instance recycles.

We recommend **Supabase** (free PostgreSQL tier) as the production database.

---

## Fixing the Prisma + Supabase Connection (P1001)

If you see:
```
Error: P1001: Can't reach database server at db.xxx.supabase.co:5432
```

This usually means:
1. **Your ISP/network blocks IPv6** or restricts direct PostgreSQL connections.
2. You are using the **Direct Connection URL** (`db.xxx.supabase.co`) for Prisma migrations.

### ✅ Solution: Use the Supabase Session Pooler for both URLs

Supabase provides a **Connection Pooler** (`*.pooler.supabase.com:5432`) that works over IPv4 and bypasses most network restrictions.

Update your `.env`:

```bash
# Application queries (with Prisma + pgbouncer flags)
DATABASE_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1"

# Migrations (use the SAME pooler URL in Session mode on port 5432)
DIRECT_URL="postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres"
```

**Why this works:**
- Port `5432` on the Supabase pooler uses **Session mode**, which is fully compatible with Prisma migrations.
- The pooler routes over IPv4 and is not blocked like the direct `db.*` hostname.
- `?pgbouncer=true&connection_limit=1` tells Prisma's query engine that it is talking through a connection pooler.

### Where to find your pooler URL
1. Go to [https://app.supabase.com](https://app.supabase.com) → your project.
2. Open **Settings → Database**.
3. Under **Connection string**, choose **URI** and copy the **Session pooler** string (port `5432`).
4. Make sure the username format is: `postgres.<project_ref>` (e.g., `postgres.opnfmyqgjtikknsohgzv`).

---

## 1. Prisma Schema (Already Configured)

Your `prisma/schema.prisma` should contain:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

This allows:
- **Queries** to use the pooled `DATABASE_URL`
- **Migrations** to use the direct `DIRECT_URL`

---

## 2. Push Code to GitHub

Make sure all code is committed and pushed:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

---

## 3. Connect Repo to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Click **"Add new site" → "Import an existing project"**.
3. Select **GitHub** as the Git provider.
4. Find and select your repository (`tanhabintehasan/Gaming-For-Sell`).
5. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command:** `npx prisma migrate deploy && npx prisma generate && npm run build`
   - **Publish directory:** `.next`

---

## 4. Set Environment Variables on Netlify

In Netlify, go to **Site configuration → Environment variables** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1` | **Yes** |
| `DIRECT_URL` | `postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-0-<REGION>.pooler.supabase.com:5432/postgres` | **Yes** |
| `JWT_SECRET` | A strong random string (min 32 chars) | **Yes** |
| `NODE_ENV` | `production` | Recommended |

### Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 5. Run Migrations

### Option A: Run migrations locally (recommended)
Make sure your local `.env` has the correct `DIRECT_URL`, then run:

```bash
npx prisma migrate deploy
npx prisma db seed
```

### Option B: Run migrations during Netlify build
Your `netlify.toml` already includes this:
```toml
[build]
  command = "npx prisma migrate deploy && npx prisma generate && npm run build"
  publish = ".next"
```

This works as long as `DIRECT_URL` is reachable from Netlify's build servers (the pooler URL almost always is).

---

## 6. Build Settings (Already Configured)

Your repo already contains `netlify.toml`:

```toml
[build]
  command = "npx prisma migrate deploy && npx prisma generate && npm run build"
  publish = ".next"

[functions]
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The `@netlify/plugin-nextjs` package is also installed in `package.json`.

---

## 7. Deploy

1. Click **Deploy site** in Netlify.
2. Wait for the build to complete (usually 2–4 minutes).
3. Netlify will provide a live URL like `https://your-site-name.netlify.app`.

---

## 8. Post-Deploy Checklist

- [ ] Visit the live URL and confirm the homepage loads.
- [ ] Log in with a test account (e.g., `13800138000` / `123456`).
- [ ] Verify the admin dashboard loads data.
- [ ] Test a core user flow (e.g., creating an order or sending a message).

---

## Troubleshooting

### "P1001: Can't reach database server"
- **Do not use** `db.xxx.supabase.co` if your network blocks it.
- **Use the pooler URL** (`*.pooler.supabase.com:5432`) for both `DATABASE_URL` and `DIRECT_URL`.
- Ensure the username is `postgres.<project_ref>` (not just `postgres` for the pooler).

### "Module not found: @prisma/client"
Make sure `npx prisma generate` runs **before** `npm run build`. This is already set in `netlify.toml`.

### API routes return 404
Ensure `netlify.toml` includes the `@netlify/plugin-nextjs` plugin and that `.next` is the publish directory.

### Images/uploads missing after refresh
Uploaded files (avatars, audio) are saved to `public/uploads/`. On Netlify, these should be committed to Git or stored in an external service (Cloudinary, AWS S3, etc.). For production, consider migrating uploads to a cloud storage provider.

---

## Quick Reference Commands

```bash
# Local dev
npm run dev

# Production build (local test)
npx prisma generate
npm run build

# Push updates
git add .
git commit -m "Update for deployment"
git push origin main
```

---

**Need help?** 
- Netlify Next.js docs: https://docs.netlify.com/frameworks/next-js/overview/
- Supabase connection docs: https://supabase.com/docs/guides/database/connecting-to-postgres
