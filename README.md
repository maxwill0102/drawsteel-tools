# Draw Steel Tools

Free tools for Directors running **DRAW STEEL**: encounter builder, encounter
calculator, browser battle table (tokens + Malice tracking), 2d10 power-roll
dice roller, and a Foundry VTT setup guide.

Draw Steel Tools is an independent product published under the DRAW STEEL
Creator License and is not affiliated with MCDM Productions, LLC.
DRAW STEEL © 2025 MCDM Productions, LLC.

## Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS
- **Backend**: Hono + tRPC (runs as a Vercel serverless function, or as a Node server)
- **Database**: MySQL via Drizzle ORM (TiDB Cloud / PlanetScale / Aiven / any MySQL 8)

## Rules data

Monster EV and Stamina are computed with the official formulas from
*Draw Steel: Monsters* (`EV = ceil((2 × level + 4) × organization modifier)`)
and verified against the published stat blocks. Difficulty budgets follow the
official encounter-building rules (`hero ES = 4 + 2 × level`).

## Local development

```bash
npm install
cp .env.example .env   # fill in DATABASE_URL
npm run db:push        # create tables
npx tsx db/seed.ts     # seed the monster data
npm run dev            # http://localhost:3000
```

## Deploy to Vercel

1. Import this repo in Vercel (or `vercel deploy` with the CLI).
2. Add the environment variable `DATABASE_URL` (a MySQL connection string).
3. After the first deploy, run `npm run db:push && npx tsx db/seed.ts` locally
   with the same `DATABASE_URL` to create tables and seed monsters.

Vercel serves the static SPA from `dist/public` and runs the tRPC API as a
single catch-all serverless function (`api/[...slug].ts`).

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | MySQL connection string |
| `APP_ID` / `APP_SECRET` / `KIMI_AUTH_URL` / `KIMI_OPEN_URL` | no | Kimi OAuth (only on the Kimi platform; sign-in UI hides itself when absent) |

## Alternative: run as a Node server (Docker / VPS / Railway)

```bash
npm run build
npm start   # serves API + static files on :3000
```

A `Dockerfile` is included.
