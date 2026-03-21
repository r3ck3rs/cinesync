# CineSync 🎬

Go to the movies together — spontaneously.

A mobile-first social cinema app that scrapes Rotterdam screenings and lets you see who's going to what film.

**Live:** [cinesync-web-production.up.railway.app](https://cinesync-web-production.up.railway.app)

---

## What it does

- Scrapes today's (and upcoming days') screenings from [filmladder.nl/rotterdam](https://www.filmladder.nl/rotterdam)
- Shows a chronological feed of screenings with TMDB posters + plot synopses
- Lets you tap **+** on any screening to mark yourself as going
- Shows overlapping avatar chips of everyone attending
- Day navigation to browse upcoming days
- PWA — installable on iOS and Android

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database | Supabase (Postgres + Auth + RLS) |
| Styling | Tailwind CSS + CSS variables |
| Font | Inter (Google Fonts) |
| Movie data | TMDB API |
| Scraper | filmladder.nl (cheerio + schema.org) |
| Hosting | Railway (Nixpacks) |

---

## Getting started

### 1. Clone and install

```bash
git clone https://github.com/r3ck3rs/cinesync.git
cd cinesync
npm install
```

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-side only) |
| `TMDB_API_KEY` | TMDB API Bearer token (server-side only) |

### 3. Database migrations

Run the SQL migrations in your Supabase dashboard or CLI:

- `profiles` table — stores first/last name + avatar URL per user
- `attendances` table — many-to-many: user ↔ screening (movie + cinema + showtime)

### 4. Run locally

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000).

---

## API endpoints

| Endpoint | Description |
|---|---|
| `GET /api/screenings` | Returns flattened screenings list (rate limited: 30 req/min/IP) |
| `GET /api/health` | Health check — scraper status + response time |

---

## Architecture

```
filmladder.nl
     │ (cheerio scraper, 30min in-memory cache)
     ▼
src/lib/screenings.ts
     │
     ├── /api/screenings (REST, rate limited)
     └── /feed (server component, parallel TMDB enrichment)
              │
              ├── ScreeningCard (poster, time, cinema)
              └── AttendanceButton (optimistic toggle, Supabase upsert)
```

---

## Testing

```bash
npm test
```

Tests cover: scraper parsing, TMDB client, attendance actions, UI components, rate limiter, health endpoint.

---

## Known limitations / backlog

- In-memory screenings cache resets on every deploy (no Redis)
- Rotterdam only — multi-city support planned
- No push notifications yet
- No monitoring/alerting beyond `/api/health`
