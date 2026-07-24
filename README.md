# Atlas — The Infrastructure Intelligence Platform

One intelligent operating system for the full lifecycle of infrastructure: engineering, manufacturing, procurement, construction, finance, and operations.

This repository contains the Atlas web application:

- **Landing site** (`/`) — the company narrative: platform overview, how it works, pricing.
- **Platform** (`/dashboard`) — the product itself: Command Center, Projects, Engineering, Procurement, Construction, Manufacturing, and Finance studios.

All modules currently run on a shared mock data layer (`lib/data.ts`) that stands in for the platform's single source of truth. Wiring it to a real backend means replacing that one file with API calls — the UI is already built around the shared-model architecture.

## Stack

- [Next.js 15](https://nextjs.org) (App Router) + React 19 + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com)

## Development

```bash
npm install
cp .env.example .env.local   # add your ANTHROPIC_API_KEY to enable the assistant
npm run dev                  # http://localhost:3000
npm run build                # production build
```

## The Atlas assistant (real AI)

The **Ask Atlas** button in the platform top bar (and the command palette's
"Ask Atlas" actions) open a chat assistant powered by a real Claude model
(`claude-opus-4-8`), served from a Next.js route handler at
`app/api/atlas/route.ts`.

- The API key is held **server-side only** — it never reaches the browser.
- The assistant answers over the platform's live project data: `lib/context.ts`
  assembles the portfolio, agent insights, procurement, suppliers, and the
  War Room briefing into the system prompt, so answers stay grounded in real
  records rather than invented facts.
- Responses stream token-by-token.
- **Without `ANTHROPIC_API_KEY` set**, the platform still runs — the assistant
  returns a setup notice instead of live answers.

To enable it:
- **Local:** put `ANTHROPIC_API_KEY=...` in `.env.local`.
- **Vercel:** add `ANTHROPIC_API_KEY` under Project → Settings → Environment
  Variables, then redeploy.

## Structure

```
app/
  page.tsx                 # Landing page
  (platform)/
    layout.tsx             # App shell: sidebar + top bar
    dashboard/             # Command Center — KPIs, agent insights, project health
    projects/              # Portfolio table
    projects/[id]/         # Project drill-down: programme, engineering,
                           #   procurement, quality, safety, finance, docs, twin
    design/                # Design packages, BIM clash detection
    engineering/           # Drawing review queue, compliance checks
    manufacturing/         # Work orders, factory intelligence
    construction/          # Programme, critical path, site metrics
    quality/               # Defect register, inspections
    safety/                # Incidents, permits, toolbox talks
    procurement/           # RFQs, benchmarks, supplier performance
    finance/               # Cashflow forecast, margins
    sales/                 # Tender pipeline, win probability
    clients/               # Client success, reports, approvals
    documents/             # Document repository, RFIs, variations
    twin/                  # Digital twin: sensors, reality capture
    marketplace/           # Suppliers, manufacturers, equipment, professionals
    analytics/             # Industry benchmarks from the intelligence network
    settings/              # Team access, AI governance
components/                # Sidebar + shared UI primitives
lib/data.ts                # Mock single-source-of-truth data layer
```
