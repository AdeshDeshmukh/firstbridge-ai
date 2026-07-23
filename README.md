# FirstBridge AI

> The advisor you never had — three specialized AI advisors for first-generation college students.

**Live Demo:** [https://firstbridge-ai.vercel.app](https://firstbridge-ai.vercel.app)
**Demo Credentials:** demo@firstbridge.ai / Demo1234!

## What It Does

FirstBridge AI gives first-generation college students three AI advisors with cross-agent persistent memory:

- **Vera** — Story advisor. Captures your background, helps you tell your story.
- **Grant** — Scholarship advisor. Finds scholarships matched to your profile.
- **Atlas** — Career advisor. Coaches you through mock interviews with real feedback.

The core innovation: when you tell Vera you are studying engineering, Grant already knows. When Atlas coaches you, he knows your financial situation from Grant. One brain. Three advisors.

## Architecture

[Architecture diagram will be added Day 3]

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Components | shadcn/ui, lucide-react |
| Backend | Express, TypeScript, Node 20 |
| Database | PostgreSQL (Supabase), Prisma ORM |
| Queue | BullMQ + Redis |
| File Storage | Cloudflare R2 |
| AI Memory | Backboard.io (3 agents) |
| Transcription | AssemblyAI |
| Photo AI | YouCam (Perfect Corp.) |
| Payments | Stripe |
| Error Monitoring | Sentry |
| Deployment | Vercel (frontend) + Railway (backend) |

## Database Schema

16 tables. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full schema with indexes.

## Local Setup

### Prerequisites
- Node.js 20+
- pnpm 8+
- Docker (for local PostgreSQL + Redis)

### Steps

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/firstbridge-ai.git
cd firstbridge-ai

# 2. Install dependencies
pnpm install

# 3. Copy environment variables
cp .env.example frontend/.env.local
cp .env.example backend/.env

# 4. Fill in your API keys in both .env files

# 5. Start local database and Redis
cd backend
docker compose up -d

# 6. Run database migrations
cd backend
pnpm prisma migrate dev

# 7. Seed scholarships
pnpm --filter backend tsx scripts/seed-scholarships.ts

# 8. Start development servers (two terminals)
pnpm dev:backend   # Terminal 1
pnpm dev:frontend  # Terminal 2
```

Frontend runs on: http://localhost:3000
Backend runs on: http://localhost:3001
Health check: http://localhost:3001/health

## Team

- Person 1 — Backend Architecture
- Person 2 — Frontend & UI

## Demo Video

[Link added Day 9]

---

*Built for Galuxium Nexus V2 Hackathon — Aug 1, 2026*