# SRT Vidyamandir — Modern Site (Next.js)

Modern animated school website for **S.R.T. Vidyamandir High School & Junior College**, built with Next.js 16, PostgreSQL (Neon), and an admin CMS for events, gallery, and announcements.

> This is the **new version** of the site. The original React (CRA) version lives in [SRT-Vidyamandir](https://github.com/harshbrickred-ctrl/SRT-Vidyamandir).

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, React Three Fiber |
| API | Next.js Route Handlers (`/api/*`) |
| Database | PostgreSQL via [Neon](https://neon.tech) + Drizzle ORM |
| Storage | Vercel Blob (gallery images) |
| Deploy | Vercel (full-stack monorepo) |

## Project Structure

```
├── src/
│   ├── app/              # Pages + API routes
│   ├── components/       # UI sections and layout
│   ├── context/          # Auth provider
│   ├── db/               # Drizzle schema + Neon client
│   └── lib/              # Auth, email, API helpers
├── scripts/              # DB seed script
├── drizzle.config.ts
└── .env.example
```

## Setup (Local)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `JWT_SECRET` | Yes | Random secret for auth tokens |
| `ADMIN_EMAIL` | Yes | Admin login email |
| `ADMIN_PASSWORD` | Yes | Admin login password |
| `BLOB_READ_WRITE_TOKEN` | For gallery | Vercel Blob token (Storage → Blob in Vercel dashboard) |
| `SMTP_*` | Optional | Email notifications for admissions/contact |

### 3. Create database tables

```bash
npm run db:push
npm run db:seed
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Login

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Default: `admin@srtvidyamandir.com` / `admin123` (change via env vars)

## Admin Dashboard

At `/admin` you can manage:

- **Events** — title, date, category, description, optional image URL
- **Gallery** — upload images (JPEG/PNG/GIF/WebP, max 10MB) to Vercel Blob
- **Announcements** — title, content, priority (normal/high/urgent)

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project on [Vercel](https://vercel.com)
3. Add environment variables from `.env.example`
4. Create a **Vercel Blob** store and link `BLOB_READ_WRITE_TOKEN`
5. Create a **Neon** database and set `DATABASE_URL`
6. After first deploy, run locally (or via CI):

   ```bash
   npm run db:push
   npm run db:seed
   ```

   Or run `db:push` against production `DATABASE_URL` before going live.

No separate backend server is required — everything runs on Vercel.

## License

Open source — use and improve freely.
