# SRT Vidyamandir — Modern Site (Next.js)

Modern animated school website for **S.R.T. Vidyamandir High School & Junior College**, built with Next.js 16, 3D hero animations, and an admin CMS for events and gallery.

> This is the **new version** of the site. The original React (CRA) version lives in [SRT-Vidyamandir](https://github.com/harshbrickred-ctrl/SRT-Vidyamandir).

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion, React Three Fiber |
| Backend | FastAPI, MongoDB, JWT auth |
| Admin | Events, gallery, announcements CMS at `/admin` |

## Project Structure

```
├── src/              # Next.js app (pages, components, lib)
├── public/           # Static assets
├── backend/          # FastAPI API server
└── render.yaml       # Backend deployment config for Render
```

## Run Locally

### 1. Backend (required for admin, events, gallery)

```bash
cd backend
cp .env.example .env   # then edit MongoDB + JWT values
pip install -r requirements.txt
python -m uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

### 2. Frontend

```bash
npm install
cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Admin Login

- URL: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- Default: `admin@srtvidyamandir.com` / `admin123`

## Gallery Uploads

Without `EMERGENT_LLM_KEY`, images are stored locally in `backend/uploads/`. For cloud storage in production, set `EMERGENT_LLM_KEY` in `backend/.env`.

## Deployment

### Backend → Render

1. Connect this repo to Render
2. Root directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn server:app --host 0.0.0.0 --port $PORT`
5. Set env vars: `MONGO_URL`, `DB_NAME`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS`

### Frontend → Vercel

1. Import this repo on Vercel (root = repo root)
2. Set `NEXT_PUBLIC_API_URL` to your Render backend URL
3. Build: `npm run build`

## License

Open source — use and improve freely.
