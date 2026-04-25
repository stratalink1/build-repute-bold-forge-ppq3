# Repute — Handoff

> Read this first. Then read `README.md` if it exists (it doesn't yet — Phase 1 will create it). This document captures every decision and open question from the prior chat session so we don't relitigate.

---

## What Repute is

A one-page website generator for local businesses. The pitch in plain English: most local businesses sound the same online because the owner writes the website. Repute reads what *customers* wrote in reviews on Google, Zomato, JustDial, Practo etc., finds the patterns, and turns those into a one-page site in the customer's words, not the owner's.

The technical pipeline is four sequential AI agents on the lyzr.ai platform:
1. **Review Aggregator** — scrapes reviews from a listing URL
2. **Pattern Analysis** (formerly "JTBD Extractor", do not use that name) — finds reasons-to-choose patterns
3. **Copy Generator** — writes website copy from those patterns
4. **Deployment Agent** — produces and deploys the HTML

Target audience: small business owners in India (Mumbai, Bengaluru, Pune, Hyderabad, Jaipur), MENA (Dubai, Riyadh), and Turkey (Istanbul). Eight live example sites exist today.

## Direct competitor

**brila.ai** ships the same wedge: Google Maps reviews → JTBD framework → one-page site. They've launched on Product Hunt, have free + Pro tiers. **We do not copy their landing style.** Their stated weakness (their own Product Hunt comments) is "single neutral template, no editor flexibility." Our differentiation is the **template system** — six templates by business type × two layout variants — picked automatically from review patterns.

---

## Decisions already made — do not relitigate

These were each discussed at length in the prior session. Treat them as locked unless the user explicitly reopens them.

### Product

- **Six templates × two variants**, codified in `lib/templates.ts`. Source of truth. The Copy Generator fills slots, it does not invent sections.
- The slider on the homepage shows **only three templates** for now (food_hospitality, health_wellness, education_coaching) because those are the categories where we have real example businesses. The other three (retail_artisan, professional_services, experience_venue) exist in `lib/templates.ts` but stay off the public slider until we have live examples.
- **Customer-facing rewrite** of the homepage is partially done: new Hero (`mode` prop, public CTA reads "See what your reviews reveal"), new Header with auth-aware right side, new Footer with three proof points, new TemplateShowcase slider. **Avinya Labs attribution removed entirely.**
- The framework name internally was "JTBD." It has been **renamed in user-facing copy to "Pattern Analysis" / "Reason-to-Choose."** The variable names `jtbdExtractor`, `jtbd_reasons`, `jtbd_patterns` remain because they are bound to the live agent's response shape on the lyzr platform. Renaming those would require changes on the agent platform itself.

### Auth + gating

- Public landing page accepts a URL input but the Copy Generator + Deployment Agent only run **after sign-up** (gate B from prior discussion).
- Anonymous visitors can run **Aggregator + Pattern Analysis** for free (~10 reviews minimum to be meaningful) and see the extracted patterns. Site itself is locked behind sign-up.
- **One free preview per browser per 24 hours**, plus IP-level rate limit (10/day/IP). Without this we burn money on anonymous traffic.
- **Magic-link email auth only.** No passwords. No Google sign-in for now.
- **`lyzr-architect` is being removed** entirely. Replacement: NextAuth + Mongoose + MongoDB Atlas (production) or local Mongo via Docker (dev) + Resend for email.

### Architecture

- Two-route split planned for Phase 2: `/` for public marketing, `/app` for authenticated app. Not yet implemented.
- The `lyzr-architect` iframe builder layer (`AgentInterceptorProvider`, `agent-fetch-interceptor`, `iframeLogger`, `IframeLoggerInit`, `HydrationGuard`) ships to every visitor today. **Conditionalise behind `NEXT_PUBLIC_LYZR_BUILDER_MODE` env var** in Phase 1.
- Three styling systems coexist (inline styles, Tailwind, shadcn). Goal is to consolidate around theme tokens (`lib/theme.ts`) in Phase 1. Don't refactor styling ad-hoc.

### Branding + writing rules (from user preferences)

- **No em dashes.** Use commas, colons, or full stops instead. The user is strict on this. There is one pre-existing em dash in `app/sections/Features.tsx` (which is now deleted as dead code, but the rule applies everywhere).
- No semicolons in user-facing copy.
- No ellipses in user-facing copy.
- No "Avinya Labs" mention anywhere. Footer just says `© 2026 Repute`.
- Bullet lists capped at five.
- Public content leads with assertions, not context.

---

## Phased plan

We agreed on four phases. We are in **Phase 0**. Do not skip ahead.

### Phase 0 — Platform replacement (in progress)
Replace `lyzr-architect` with NextAuth + Mongoose + Resend.

### Phase 1 — Cleanup + structure (after Phase 0)
- Theme tokens (`lib/theme.ts`)
- Config consolidation (`lib/config.ts`, agent IDs out of PageClient)
- Conditionalise iframe builder layer
- Extract pipeline orchestration to `lib/pipeline.ts` + `lib/agents/*`
- Rewrite PageClient (currently 681 lines) as thin consumer with `useReducer`
- Add `app/sections/PreviewGate.tsx` and finish auth-gated preview flow
- README.md
- JSDoc on every exported function in `lib/*`

### Phase 2 — Route split + auth hardening (after Phase 1)
- Split `/` (public) from `/app` (authenticated) using Next.js app router groups
- Add `middleware.ts` for server-side auth on `/app/*`
- Move Dashboard to `/app/sites`
- Add `/sites/[slug]` for public-facing generated-site preview
- Env-var validation at boot with `zod`
- CI on every push (typecheck, lint, build)

---

## Phase 0 — exact status

### Done and committed (4 commits beyond main)

- **`d5b8912`** — checkpoint: clean baseline before phase 1 refactor
  - Reverted half-wired changes from earlier in the session
  - Preserved clean additions: `lib/templates.ts`, `hooks/useAuth.ts`, `app/sections/TemplateShowcase.tsx`, new `Header.tsx`, new `Footer.tsx`, `mode` prop on `Hero.tsx`

- **`957d805`** — step 1: remove dead code
  - Deleted 8 unused marketing components (LandingContent, Navbar, CTASection, SocialProof, Features, HowItWorks, Globe, ShowcaseGrid)
  - Deleted 3 unused services (scheduler.ts, ragKnowledgeBase.ts, KnowledgeBaseUpload.tsx)
  - Deleted 3 unused API routes (/api/scheduler, /api/rag, /api/upload)
  - Removed orphan upload code from `lib/aiAgent.ts`
  - Net: about 3000 lines of dead code gone

- **`48525bc`** — phase 0 step 7: NextAuth + Mongoose foundation
  - `package.json`: dropped `lyzr-architect`, added `next-auth`, `mongoose`, `mongodb`, `@auth/mongodb-adapter`, `resend`, `nodemailer`, `@types/nodemailer`
  - `lib/db.ts`: Mongoose connection cache with hot-reload safety
  - `lib/email.ts`: magic-link sender. **In dev, logs the URL to the server console instead of sending.** In prod, calls Resend.
  - `lib/auth.ts`: NextAuth config with EmailProvider override that calls our `sendMagicLink`. Uses MongoDBAdapter and database session strategy.
  - `app/api/auth/[...nextauth]/route.ts`: NextAuth catch-all
  - `components/ClientProviders.tsx`: wrapped children in `<SessionProvider>`

- **`b01c948`** — phase 0 step 8-9: port models + sites GET/POST
  - `models/GeneratedSite.ts`: plain Mongoose schema, cached model accessor
  - `models/ReviewData.ts`: same pattern
  - `app/api/sites/route.ts`: rewrite using `getServerSession(authOptions)` and the new Mongoose model. Scopes GET to `user_id`. POST tags new docs with `user_id`.

### Phase 0 remaining (this is where the next session picks up)

In rough priority order:

1. **`app/api/sites/[slug]/route.ts`** — still imports `lyzr-architect`. Same pattern as `app/api/sites/route.ts`: use `getServerSession`, use Mongoose `GeneratedSite` model. Public read (no auth required to view a generated site by slug) but check whether the current behaviour requires auth — match it.

2. **`app/sections/AuthModal.tsx`** — currently imports `LoginForm` and `RegisterForm` from `lyzr-architect/client`. Rewrite as a single email-input form. On submit, call `signIn('email', { email, redirect: false })` from `next-auth/react` and show a "check your inbox" success state. ~80 lines, no dependencies on lyzr-architect.

3. **`hooks/useAuth.ts`** — currently fetches `/api/auth/me`. Rewrite to use NextAuth's `useSession()` hook from `next-auth/react`. Drop the `refresh()` method, NextAuth handles session refresh internally.

4. **Delete** `app/api/auth/login/route.ts`, `app/api/auth/logout/route.ts`, `app/api/auth/me/route.ts`. NextAuth's catch-all handles all of these now.

5. **`.env.example`** at repo root with:
   ```
   # Database
   MONGODB_URI=mongodb://localhost:27017/repute

   # Auth
   NEXTAUTH_SECRET=
   NEXTAUTH_URL=http://localhost:3333

   # Email (production only — dev logs to console)
   RESEND_API_KEY=
   EMAIL_FROM=Repute <noreply@repute.site>

   # Lyzr platform (existing)
   LYZR_API_KEY=
   LYZR_AGENT_BASE_URL=

   # Phase 1: when iframe builder layer is conditionalised
   NEXT_PUBLIC_LYZR_BUILDER_MODE=false
   ```

6. **Smoke test locally**:
   - Start Mongo: `docker run -d -p 27017:27017 --name repute-mongo mongo:7`
   - `npm install`
   - Generate a NEXTAUTH_SECRET: `openssl rand -base64 32`
   - Set `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` in `.env.local`
   - `npm run dev`
   - Click "Sign in" → enter email → check the dev terminal for the magic link → paste in browser → verify session is set
   - Hit `/api/sites` while signed in (returns array) and signed out (returns 401)

7. **Final commit** of Phase 0 with a `phase 0 complete` message.

### Phase 0 risks to watch

- **`@auth/mongodb-adapter` expects a `Promise<MongoClient>`.** Our `lib/db.ts` exposes `getMongoClient()` for this purpose. Watch for issues with the MongoDB driver vs Mongoose — they share a connection but the adapter writes to NextAuth's collections (`users`, `accounts`, `sessions`, `verification_tokens`) using the native driver, while our app code uses Mongoose against `generatedsites` and `reviewdatas`. One DB, two access patterns. This is intentional and standard but worth understanding.
- **Cookie domain in dev.** `NEXTAUTH_URL` must match exactly what the browser sees. If you run on `http://localhost:3333` and set `NEXTAUTH_URL=http://127.0.0.1:3333`, sessions will fail silently. Use one or the other consistently.
- **Production magic links require a verified Resend domain.** `EMAIL_FROM=Repute <noreply@repute.site>` will not send until `repute.site` is verified in Resend's dashboard. For initial production testing, fall back to `Repute <onboarding@resend.dev>` (Resend's shared sandbox sender) which works without verification but is rate-limited and shouldn't be used long-term.

---

## Existing pipeline orchestration — read before touching

`app/PageClient.tsx` is **681 lines** and owns: auth state, URL input state, pipeline orchestration (4 agents sequentially), per-agent state machine, timer, response parsing, fallback HTML generation, and the render. Phase 1 extracts most of this into `lib/pipeline.ts` and `lib/agents/*`.

**Do not refactor PageClient in Phase 0.** Phase 0 is platform replacement only. The pipeline still works as-is. The auth gate is part of Phase 1's PageClient rewrite, not Phase 0.

The 300+ lines of defensive parsing in PageClient are there for a reason — the lyzr platform returns inconsistent response shapes per agent. When extracting in Phase 1, **keep the parser logic byte-for-byte identical in the first pass**, just relocate. Tighten the types in a follow-up commit.

---

## Conventions to follow

- **Inline styles preferred for marketing components** (Hero, Footer, Header, TemplateShowcase). The codebase has three styling systems (inline, Tailwind, shadcn). Don't add a fourth. Don't unify them in Phase 0.
- **shadcn/ui components for app/dashboard surfaces** (Dashboard, AuthModal, SitePreview).
- **Lora serif headlines, Inter sans body.** Defined as CSS vars in `app/layout.tsx`.
- **Brand palette** (currently inlined, will move to `lib/theme.ts` in Phase 1):
  - Background `#FAF7F2` (cream)
  - Ink `rgba(0,0,0,0.9)` for primary text
  - Ochre `#E8A000` (primary accent)
  - Terracotta `#E07856` (secondary accent, also error states)
  - Sage `#7A9E7E` (tertiary accent)
- **No new component libraries.** No animation libraries. Keep dependencies tight.

---

## Open questions for the user

When the new session asks the user, here's what's pending:

1. **MongoDB Atlas account for production** — user has not provisioned yet. Local Docker Mongo is fine for dev work. Atlas cluster + connection string needed before deploying.
2. **Resend account + sending domain** — same. Dev mode logs to console so this is not blocking. Required before production traffic.
3. **`EMAIL_FROM` domain choice** — `repute.site` is the assumed domain but not yet verified. May need a fallback for early production.
4. **The 5-week LinkedIn content calendar** and **lead magnet** mentioned in user memory are unrelated to this codebase — do not get drawn into them unless the user explicitly asks.

---

## Branch state

- Working branch: **`customer-facing-rewrite`**
- Base: **`main`**
- Commits beyond main: **4** (see "Done and committed" above)
- Working tree on handoff: **clean**
- Has not been pushed to GitHub. The user has access at `github.com/stratalink1/build-repute-bold-forge-ppq3`. Push when ready.

---

## How to start the next session

In Claude Code, after opening the repo, the user will say something like *"Read HANDOFF.md and tell me what's next"*. The right answer is:

1. Confirm the user wants to continue Phase 0 (vs jumping ahead)
2. List the Phase 0 remaining items above
3. Ask which to tackle first, or default to the priority order shown
4. **Before any code change**, propose the change first and wait for approval (the user explicitly asked for this pattern)

Do not start writing code without confirming the plan. The user has been clear about this preference throughout the prior session.
