# Revti CMS

A scalable, SaaS-grade CMS platform built on **Next.js 15 (App Router)**, **TypeScript**, **Prisma**, **Auth.js**, **Tailwind + shadcn/ui**, and **Vercel Blob** — designed for serverless deployment on Vercel.

## Features

- **Content**: Posts, Pages, Categories, Tags with draft/published/archived states and SEO fields
- **Media library**: uploads to Vercel Blob, stores URL + alt text + metadata (no local filesystem)
- **Navigation & Site Settings** modules
- **Auth.js (NextAuth v5)** credentials login with JWT sessions
- **Role-based access**: `SUPER_ADMIN`, `ADMIN`, `CONTENT_MANAGER`
- **Public frontend** (`/`, `/blog`, dynamic pages) + **admin dashboard** (`/admin`)
- Dark/light mode, error boundaries, loading & empty states, Zod validation throughout

## Tech Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| Framework | Next.js 15 App Router, React 19, TypeScript strict |
| Styling   | Tailwind CSS v4, shadcn/ui, next-themes            |
| Database  | Prisma ORM + PostgreSQL (Neon / Supabase / Vercel) |
| Auth      | Auth.js / NextAuth v5 (credentials, JWT)           |
| Storage   | Vercel Blob (S3 / Cloudinary compatible)           |
| Deploy    | Vercel (serverless + edge middleware)              |

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment** — copy `.env.example` to `.env` and fill in values:

   | Variable                | Purpose                                              |
   | ----------------------- | ---------------------------------------------------- |
   | `DATABASE_URL`          | Pooled Postgres connection (runtime)                 |
   | `DIRECT_DATABASE_URL`   | Direct Postgres connection (migrations)              |
   | `AUTH_SECRET`           | Auth.js secret — `openssl rand -base64 32`           |
   | `AUTH_URL`              | Canonical app URL (auto-set on Vercel)               |
   | `BLOB_READ_WRITE_TOKEN` | Vercel Blob token (auto-provisioned on Vercel)       |
   | `NEXT_PUBLIC_APP_URL`   | Public URL for SEO / metadata / absolute links       |

3. **Set up the database**

   ```bash
   npm run db:push     # sync schema
   npm run db:seed     # create the default super admin
   ```

   Default seeded credentials: **admin@revti.com** / **admin123** — change immediately after first login.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Frontend at [localhost:3000](http://localhost:3000), admin at [localhost:3000/admin](http://localhost:3000/admin).

## Roles & Permissions

| Capability                         | Content Manager | Admin | Super Admin |
| ---------------------------------- | :-------------: | :---: | :---------: |
| Manage posts / pages / media / tags |       ✅        |  ✅   |     ✅      |
| Manage navigation & site settings  |       —         |  ✅   |     ✅      |
| Create / update users              |       —         |  ✅   |     ✅      |
| Delete users                       |       —         |  —    |     ✅      |

## Deployment (Vercel)

1. Push to GitHub and import the repo into Vercel.
2. Add a Postgres database (Neon / Vercel Postgres) and a Blob store — their env vars are injected automatically.
3. Set `AUTH_SECRET` and `NEXT_PUBLIC_APP_URL` in Project → Settings → Environment Variables.
4. Deploy. The build runs `prisma generate && next build`. Run `db:push` + `db:seed` against the production database once.

## Scripts

| Script            | Description                        |
| ----------------- | --------------------------------- |
| `npm run dev`     | Start dev server (Turbopack)      |
| `npm run build`   | Prisma generate + production build |
| `npm run db:push` | Push schema to the database       |
| `npm run db:seed` | Seed the default super admin      |
| `npm run db:studio` | Open Prisma Studio              |
