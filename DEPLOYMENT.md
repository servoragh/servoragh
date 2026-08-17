# Servora — Production Deployment Guide

## Zero-Capital Deployment to Vercel + Supabase

---

## 1. Prerequisites
- GitHub account
- Vercel account (Free Tier)
- Supabase account (Free Tier PostgreSQL) or Railway / Render Free Tier

---

## 2. Step-by-Step Setup

### Step 1: Provision Free Database (Supabase / Neon)
1. Log into [Supabase](https://supabase.com) or [Neon](https://neon.tech) and create a new free PostgreSQL project named `servora`.
2. Copy the Connection String URI (`postgresql://postgres:...@db...supabase.co:5432/postgres`).

### Step 2: Push Repository to GitHub
```bash
git init
git add .
git commit -m "Initial Servora MVP"
git branch -M main
git remote add origin https://github.com/your-username/servora.git
git push -u origin main
```

### Step 3: Deploy to Vercel
1. Import repository on [Vercel](https://vercel.com).
2. Set Environment Variables:
   - `DATABASE_URL`: Your Supabase connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: `https://servora.vercel.app`
3. Click **Deploy**. Vercel automatically builds and deploys the application.

### Step 4: Run Prisma Database Migrations & Seeding
```bash
npx prisma db push
npx prisma db seed
```
