# Atlas OS — Design System & Platform Architecture

This document is the working reference for the Atlas redesign: the design language, navigation model, AI workforce contract, and data architecture that the code implements. It is deliberately concise — the code is the source of truth; this explains the intent behind it.

---

## 1. Design philosophy

Atlas is an operating system, not a collection of apps. The design rules that follow from that:

- **Monochrome first.** The interface is a dark grayscale surface system. Color is reserved for meaning: one accent (signal orange) for primary actions and active context, and four desaturated status hues (positive/caution/critical/info) that appear only where state genuinely matters. A screen with nothing wrong should read as calm gray.
- **Dense but quiet.** Enterprise users live in tables. Density comes from tight type scale (11–14px working sizes), hairline borders, and uppercase micro-labels — not from cramming. Status is a 6px dot, not a colored pill.
- **Keyboard is a first-class citizen.** ⌘K opens the command palette from anywhere: navigate modules, jump to projects, trigger AI actions. Arrow keys + Enter operate it fully.
- **Everything is contextual to a project.** The project drill-down is the center of gravity; every module row links into it, and the palette makes any project two keystrokes away.
- **Motion has a purpose.** Transitions are 75–150ms color/surface shifts that confirm interaction. Nothing animates for decoration.

## 2. Design tokens

Defined in `app/globals.css` under `@theme` (Tailwind v4):

| Token | Value | Use |
|---|---|---|
| `base` | `#0a0c10` | App background |
| `surface` | `#10141b` | Cards, panels |
| `raise` | `#171c26` | Hover / active surfaces |
| `overlay` | `#1b212d` | Popovers, command palette |
| `edge` / `edge-strong` | `#1f2632` / `#2c3644` | Hairline borders |
| `fg` / `fg-muted` / `fg-faint` | `#eef1f6` / `#98a2b3` / `#5d6675` | Type hierarchy |
| `accent` / `accent-hover` | `#e8842c` / `#f09a4b` | Primary actions, active markers — used sparingly |
| `positive` / `caution` / `critical` / `info` | `#34d399` / `#fbbf24` / `#f87171` / `#60a5fa` | Status only |

Typography: Inter stack, `tabular-nums` globally so every number column aligns. Working sizes: 11px micro-labels (uppercase, wide tracking), 13–14px body, 20–24px KPIs.

Component primitives live in `components/ui.tsx`: `Card`, `CardHeader`, `Kpi`, `Badge` (monochrome pill + status dot), `Progress` (1px track, tone only on variance), `Table`, `PageHeader`. Every module page is composed from these — restyling the platform is a one-file change.

## 3. Navigation map

```
/                      Landing (public narrative)
/dashboard             Command Center — portfolio KPIs, agent insights, health
/projects              Portfolio
/projects/[id]         PROJECT HUB — programme, engineering, procurement,
                       quality, safety, finance, documents, twin (anchor nav)
/intelligence          Infrastructure Intelligence — sectors, operating assets
/analytics             Benchmarks vs the intelligence network
/design                Design & Architecture — packages, clash detection
/engineering           Drawing review, compliance
/manufacturing         Work orders, factory intelligence
/construction          Programme, critical path, site metrics
/quality               Defects, inspections
/safety                Incidents, permits
/procurement           RFQs, benchmarks, supplier performance
/finance               Cashflow, margins
/sales                 Tender pipeline
/clients               Client success and approvals
/agents                AI WORKFORCE — agent registry and governance
/documents             Repository, RFIs, variations
/twin                  Sensors, reality capture
/marketplace           Verified partner network
/settings              Team, permissions, AI governance
```

Sidebar groups: **Overview / Delivery / Commercial / Platform**. The command palette (⌘K) exposes the same map plus projects and AI quick actions.

## 4. AI Workforce contract

Every agent (see `/agents` and `lib/data.ts → agents`) declares:

- **Purpose** — one sentence, no scope creep.
- **Inputs / Outputs** — what it reads from the knowledge graph, what it writes back.
- **Autonomy class** — `Autonomous within limits` | `Requires approval` | `Recommends only`.
- **Approval gate** — the specific human sign-off that bounds it (e.g. Procurement AI: POs above R500k; Engineering AI: engineer sign-off before issue; Legal AI: everything reviewed by counsel).
- **Acceptance rate** — the share of its recommendations humans accept, surfaced publicly. An agent that humans ignore is a bug, and the metric makes that visible.

Agents interact through the shared project model, never by messaging each other privately — an agent's output is written to the graph, where other agents (and humans) read it. That keeps every hand-off auditable.

## 5. Data architecture

One unified model in `lib/data.ts` (mock today, API-shaped for the backend):

```
Project ─┬─ ScheduleItem (programme)          ─ Insight (agent output)
         ├─ EngReview / ClashSet / DesignPackage
         ├─ Rfq / WorkOrder / Supplier (via spend)
         ├─ Defect / Inspection / SafetyItem
         ├─ Variation / CashflowMonth (finance)
         ├─ Doc / Rfi
         └─ Sensor / TwinCapture ──► AssetRecord (post-handover)
Company ─┬─ Client / Opportunity (pipeline)
         ├─ TeamMember (permissions)
         ├─ MarketListing (marketplace network)
         └─ Benchmark / SectorIntel (intelligence network)
Agent ───── writes Insights, reads everything its inputs declare
```

Rules: no duplicated facts (project names, budgets, statuses exist once); every module filters the same arrays by `project`; the digital twin is not a separate copy — it is the same record continuing after handover.

## 6. Roles & permissions (target model)

- **Admin** — org settings, members, AI governance, all projects.
- **Editor** — full read/write on assigned projects and modules.
- **Viewer** — read-only; used for client portal access (scoped to their projects, commercial data redacted).
- Agent permissions are governed separately in Settings → AI governance; agents never exceed the access of the humans who configured them.

## 7. Roadmap (post-redesign)

1. **Auth + multi-tenancy** — the shell is ready; `lib/data.ts` becomes per-tenant API calls.
2. **Live document intelligence** — first real AI capability: drawing upload → indexing → review findings.
3. **Real-time collaboration** — presence, comments, shared cursors on the project hub.
4. **Light theme + accessibility pass** — tokens are semantic, so a light mapping is additive; WCAG contrast is already respected in dark.
5. **Mobile/tablet** — the site diary, inspections, and approvals flows first (field usage), not the full desktop surface.
6. **Offline mode** — queue mutations from site, reconcile on reconnect.

## 8. Known trade-offs (self-critique)

- **Mock data everywhere.** The redesign is honest about being a front-end; nothing pretends to persist. The single data layer is the deliberate seam for the backend.
- **Palette is navigational, not executive.** ⌘K actions currently deep-link rather than execute. Real AI actions need the orchestration backend.
- **Dark-only today.** The token system supports a light theme but it is not yet mapped; some enterprise buyers will ask for it.
- **No mobile layouts yet.** Tables scroll horizontally on small screens but the field experience needs purpose-built flows.
- **Anchor-nav project hub.** At 3× the current data volume the hub should become true sub-routes with lazy loading; anchors were chosen for zero-JS speed at current scale.
