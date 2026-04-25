# Repute

One-page website generator for local businesses. Reads customer reviews from Google, Zomato, JustDial, Practo — finds the patterns — turns them into a website in the customer's words, not the owner's.

## How it works

Four sequential AI agents on the lyzr.ai platform:

1. **Review Aggregator** — scrapes reviews from a listing URL
2. **Pattern Analysis** — finds reasons-to-choose patterns from review data
3. **Copy Generator** — writes website copy from those patterns
4. **Deployment Agent** — produces and deploys the HTML

Anonymous visitors run steps 1–2 for free. Steps 3–4 require sign-in.

## Setup

### Prerequisites

- Node.js 20+
- Docker (for local MongoDB)

### Install

```bash
git clone https://github.com/stratalink1/build-repute-bold-forge-ppq3
cd build-repute-bold-forge-ppq3
npm install
```

### Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable | How to get it |
|----------|--------------|
| `MONGODB_URI` | Use `mongodb://localhost:27017/repute` for local dev |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `http://localhost:3333` for local dev |
| `LYZR_API_KEY` | From lyzr.ai dashboard |
| `LYZR_AGENT_BASE_URL` | From lyzr.ai dashboard |
| `RESEND_API_KEY` | Production only — dev logs magic links to console |

### Run

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name repute-mongo mongo:7

# Start dev server
npm run dev
```

App runs at [http://localhost:3333](http://localhost:3333).

**Sign-in in dev:** submit the email form, then watch the terminal for the magic link. No email is sent locally.

## Project structure

```
app/
  api/
    auth/[...nextauth]/   NextAuth catch-all
    sites/                GET/POST generated sites
    agent/                Lyzr agent proxy
  sections/
    Hero.tsx              Landing hero (mode prop: public vs app)
    Header.tsx            Auth-aware header
    Footer.tsx
    AuthModal.tsx         Magic-link sign-in modal
    TemplateShowcase.tsx  Template slider (3 live examples)
    Dashboard.tsx         Authenticated site list
    SitePreview.tsx       Generated site preview
  PageClient.tsx          Pipeline orchestration (681 lines, Phase 1 will refactor)
  page.tsx

lib/
  auth.ts                 NextAuth config
  db.ts                   Mongoose connection cache
  email.ts                Magic-link sender (Resend in prod, console in dev)
  templates.ts            6 templates x 2 variants — source of truth

models/
  GeneratedSite.ts
  ReviewData.ts

hooks/
  useAuth.ts              Thin wrapper around useSession()
```

## Templates

Six templates by business type, two layout variants each. Defined in `lib/templates.ts` — the Copy Generator fills slots, it does not invent sections.

| Template key | Shown in slider |
|---|---|
| `food_hospitality` | Yes |
| `health_wellness` | Yes |
| `education_coaching` | Yes |
| `retail_artisan` | Not yet (no live examples) |
| `professional_services` | Not yet |
| `experience_venue` | Not yet |

## Auth

Magic-link email only. No passwords. No OAuth.

- Anonymous: run Review Aggregator + Pattern Analysis, see extracted patterns
- Signed in: run Copy Generator + Deployment Agent, get the site

Rate limits: one free preview per browser per 24 hours, 10/day per IP.

## Deployment

Targets Vercel. MongoDB Atlas required for production — set `MONGODB_URI` to your Atlas connection string. Magic-link email requires a verified Resend domain (`repute.site`).

## Copy rules

- No em dashes. Use commas, colons, or full stops.
- No semicolons in user-facing copy.
- No ellipses in user-facing copy.
- Bullet lists capped at five.
- Lead with assertions, not context.
