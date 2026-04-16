# Netlify Deployment Guide

This guide covers deploying the **Su-Ling Esports** Next.js application to Netlify.

---

## ⚠️ Important: Database Requirement

This project currently uses **SQLite** (`prisma/dev.db`) for local development.

**SQLite is NOT suitable for Netlify production** because:
- Netlify Functions are **serverless and stateless** — any writes to a local file will be lost when the function instance recycles.
- Netlify deploys are **immutable** — the filesystem is read-only except for `/tmp`, which is also ephemeral.

### You have two options for production:

#### Option A: Use a Serverless Database (Recommended)
Migrate to **PostgreSQL** via one of these free providers:
- **Neon** (https://neon.tech) — serverless PostgreSQL
- **Supabase** (https://supabase.com) — PostgreSQL with generous free tier

Steps:
1. Create a PostgreSQL database on Neon or Supabase.
2. Copy the connection string (e.g., `postgresql://user:pass@host/db`).
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations locally (or from your computer) against the remote DB:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

#### Option B: Keep SQLite for Demo Only
If you only need a **static demo** with no mutations (orders, messages, etc.), you can commit `prisma/dev.db` to Git and set:
```
DATABASE_URL="file:./prisma/dev.db"
```
**Not recommended** for real usage.

---

## 1. Push Code to GitHub

Make sure all code is committed and pushed:

```bash
git add .
git commit -m "Prepare for Netlify deployment"
git push origin main
```

---

## 2. Connect Repo to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com) and log in.
2. Click **"Add new site" → "Import an existing project"**.
3. Select **GitHub** as the Git provider.
4. Find and select your repository (`tanhabintehasan/Gaming-For-Sell`).
5. Netlify will auto-detect the build settings from `netlify.toml`:
   - **Build command:** `npx prisma generate && npm run build`
   - **Publish directory:** `.next`

---

## 3. Set Environment Variables

In Netlify, go to **Site configuration → Environment variables** and add:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | Your PostgreSQL connection string | **Yes** |
| `JWT_SECRET` | A strong random string (min 32 chars) | **Yes** |
| `NODE_ENV` | `production` | Recommended |

### Generate a JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 4. Database Migration on Netlify (if using PostgreSQL)

You have two ways to run Prisma migrations:

### Method A: Run migrations locally before pushing
```bash
npx prisma migrate deploy
npx prisma db seed
```

### Method B: Run migrations as part of the Netlify build
Update `netlify.toml`:
```toml
[build]
  command = "npx prisma migrate deploy && npx prisma generate && npm run build"
  publish = ".next"
```
**Note:** `prisma migrate deploy` requires write access to the database. Ensure your `DATABASE_URL` has full permissions.

---

## 5. Build Settings (Already Configured)

Your repo already contains `netlify.toml`:

```toml
[build]
  command = "npx prisma generate && npm run build"
  publish = ".next"

[functions]
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

The `@netlify/plugin-nextjs` package is also installed in `package.json`.

---

## 6. Deploy

1. Click **Deploy site** in Netlify.
2. Wait for the build to complete (usually 2–4 minutes).
3. Netlify will provide a live URL like `https://your-site-name.netlify.app`.

---

## 7. Post-Deploy Checklist

- [ ] Visit the live URL and confirm the homepage loads.
- [ ] Log in with a test account (e.g., `13800138000` / `123456`).
- [ ] Verify the admin dashboard loads data.
- [ ] Test a core user flow (e.g., creating an order or sending a message).

---

## Troubleshooting

### "Module not found: @prisma/client"
Make sure `npx prisma generate` runs **before** `npm run build`. This is already set in `netlify.toml`.

### "Database is read-only" or "SQLITE_BUSY"
You are trying to write to SQLite on Netlify. **Switch to PostgreSQL** (see Option A above).

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

**Need help?** Check the Netlify Next.js docs: https://docs.netlify.com/frameworks/next-js/overview/
