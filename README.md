# DealerAI — Production Next.js

## Local
```bash
npm install
cp .env.example .env.local
# set DATABASE_URL (Neon) and GEMINI_API_KEY
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Hosting
- Database: Neon Postgres (`DATABASE_URL`)
- App: Vercel, connected to this GitHub repo
