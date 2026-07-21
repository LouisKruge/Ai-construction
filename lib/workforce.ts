// The AI Workforce: full department hierarchies, chief-agent specs, the
// executive morning meeting, the AI Board, and the simulation engines.
// Mock data shaped for the orchestration backend that will replace it.

export type Autonomy =
  | "Autonomous within limits"
  | "Requires approval"
  | "Recommends only";

export interface DeptAgent {
  name: string;
  dept: string;
  tier: "chief" | "specialist";
  mission: string;
  autonomy: Autonomy;
  gate: string;
}

export interface Department {
  slug: string;
  name: string;
  chief: string;
  summary: string;
  monitors: string[];
  cadence: string; // the question the chief continuously asks
  collaborates: string[];
  actions30d: number;
  escalations: number;
}

export const departments: Department[] = [
  {
    slug: "engineering",
    name: "Engineering",
    chief: "Chief Engineering AI",
    summary:
      "Concept through detailed design, construction support, commissioning, and asset operation across every discipline.",
    monitors: [
      "Design progress and revision flow",
      "Interdisciplinary conflicts and clash sets",
      "Code compliance across SANS / Eurocode / project specs",
      "Engineering risk register",
      "Calculation and drawing review queues",
    ],
    cadence: "Is every discipline consistent, compliant, and constructible today?",
    collaborates: ["Construction", "Manufacturing", "Procurement", "Finance"],
    actions30d: 1240,
    escalations: 9,
  },
  {
    slug: "manufacturing",
    name: "Manufacturing",
    chief: "Chief Manufacturing AI",
    summary:
      "The digital factory manager: production planning, machine scheduling, material optimization, quality, and logistics.",
    monitors: [
      "Factory utilization and machine availability",
      "Material availability and nesting efficiency",
      "Quality trends and inspection results",
      "Delivery performance and shipping",
      "Production cost and carbon footprint",
    ],
    cadence: "Is there a better way to run today's production?",
    collaborates: ["Engineering", "Procurement", "Construction", "Finance"],
    actions30d: 861,
    escalations: 5,
  },
  {
    slug: "construction",
    name: "Construction",
    chief: "Chief Construction AI",
    summary:
      "The digital construction director for projects from R10m to R100bn: programme, site, commercial, quality, and safety.",
    monitors: [
      "Schedule performance and critical path",
      "Productivity, labour, and subcontractors",
      "Site logistics, equipment, and weather",
      "Quality, safety, and permits",
      "Budget, cash flow, and claims exposure",
    ],
    cadence: "What is preventing this project finishing earlier, safer, cheaper, or better?",
    collaborates: ["Engineering", "Manufacturing", "Procurement", "Finance"],
    actions30d: 1685,
    escalations: 12,
  },
  {
    slug: "procurement",
    name: "Procurement",
    chief: "Chief Procurement AI",
    summary:
      "The complete procurement lifecycle: sourcing, supplier intelligence, RFQs, contracts, inventory, logistics, and spend.",
    monitors: [
      "Material demand vs construction and manufacturing schedules",
      "Supplier performance, risk, and capacity",
      "Commodity prices, currency, and lead times",
      "Open RFQs, POs, and contract milestones",
      "Inventory, warehousing, and deliveries",
    ],
    cadence: "What should be purchased today — and what should not be purchased yet?",
    collaborates: ["Engineering", "Manufacturing", "Construction", "Finance"],
    actions30d: 977,
    escalations: 7,
  },
  {
    slug: "finance",
    name: "Finance",
    chief: "CFO AI",
    summary:
      "The enterprise financial brain: accounting, treasury, forecasting, project profitability, risk, and audit readiness.",
    monitors: [
      "Cash, liquidity, and working capital",
      "Project margins and earned value (CPI/SPI)",
      "Commitments, payables, and receivables",
      "Currency and commodity exposure",
      "Budget variance and forecast confidence",
    ],
    cadence: "How will today's decisions affect next year's financial performance?",
    collaborates: ["Procurement", "Construction", "Manufacturing", "Executive"],
    actions30d: 1102,
    escalations: 6,
  },
  {
    slug: "executive",
    name: "Executive",
    chief: "CEO AI",
    summary:
      "Strategic coordination: the executive AI team, the daily AI meeting, and the AI Board governance layer above it.",
    monitors: [
      "Company-wide KPIs and health score",
      "Cross-department conflicts and dependencies",
      "Strategic risks and opportunities",
      "Client satisfaction and pipeline",
      "Every department's recommendations",
    ],
    cadence: "What are the highest-impact decisions humans should make today?",
    collaborates: ["Every department"],
    actions30d: 214,
    escalations: 4,
  },
];

// Compact roster builder. [name, mission, autonomy code, gate]
// A = autonomous within limits, R = requires approval, O = recommends only.
type Row = [string, string, "A" | "R" | "O", string];
const AUT: Record<"A" | "R" | "O", Autonomy> = {
  A: "Autonomous within limits",
  R: "Requires approval",
  O: "Recommends only",
};

function dept(deptName: string, chief: Row, rows: Row[]): DeptAgent[] {
  const mk = (r: Row, tier: "chief" | "specialist"): DeptAgent => ({
    name: r[0],
    dept: deptName,
    tier,
    mission: r[1],
    autonomy: AUT[r[2]],
    gate: r[3],
  });
  return [mk(chief, "chief"), ...rows.map((r) => mk(r, "specialist"))];
}

export const deptAgents: DeptAgent[] = [
  ...dept(
    "Engineering",
    ["Chief Engineering AI", "Coordinates every discipline; resolves conflicts; escalates to licensed engineers.", "O", "All coordination advisory; sign-off always human"],
    [
      ["Civil Engineering AI", "Roads, earthworks, utilities, grading, stormwater reviews and quantities.", "A", "Engineer sign-off before issue"],
      ["Structural Engineering AI", "Member sizing, load paths, stability, connections, optimisation. Never issues final approval.", "A", "Licensed engineer sign-off, always"],
      ["Mechanical Engineering AI", "Piping, pressure systems, pumps, rotating equipment, layouts and sizing.", "A", "Engineer sign-off before issue"],
      ["Electrical Engineering AI", "Single-lines, cable sizing, voltage drop, protection, earthing, load schedules.", "A", "Engineer sign-off before issue"],
      ["Fire Engineering AI", "Escape analysis, occupancy, fire water, detection, suppression, smoke control.", "A", "Fire engineer sign-off"],
      ["Geotechnical Engineering AI", "Boreholes, bearing capacity, settlement, slopes, foundation recommendations.", "O", "Geotechnical engineer approval"],
      ["Transportation Engineering AI", "Intersection analysis, road safety, traffic modelling, pavement design review.", "O", "Engineer approval"],
      ["Water Engineering AI", "Water supply, reticulation, storage, pump stations, demand modelling.", "A", "Engineer sign-off before issue"],
      ["Drainage Engineering AI", "Stormwater networks, attenuation, flood routing, outfall design review.", "A", "Engineer sign-off before issue"],
      ["Environmental Engineering AI", "Impact screening, water quality, waste, environmental compliance conditions.", "O", "Environmental practitioner approval"],
      ["Mining Engineering AI", "Pit design review, ventilation, ground support, mine infrastructure.", "O", "Mining engineer approval"],
      ["Industrial Engineering AI", "Process layouts, throughput, workflow optimisation for industrial facilities.", "A", "Engineer sign-off before issue"],
      ["Building Services AI", "Wet services, vertical transport, BMS coordination across buildings.", "A", "Engineer sign-off before issue"],
      ["HVAC Engineering AI", "Cooling/heating loads, airflow, duct sizing, equipment, energy optimisation.", "A", "Engineer sign-off before issue"],
      ["Renewable Energy Engineering AI", "PV, wind, storage: yield modelling, layout, grid connection review.", "A", "Engineer sign-off before issue"],
      ["Commissioning AI", "Commissioning plans, test packs, punch tracking, handover readiness.", "A", "Commissioning manager approval"],
      ["Engineering Compliance AI", "Verifies work against codes, specs, client standards; flags with references.", "A", "Filings require sign-off"],
      ["Engineering QA/QC AI", "Drawing and calculation QA, revision integrity, deliverable completeness.", "A", "QA manager closes findings"],
      ["Engineering Risk AI", "Design, constructability, material and regulatory risk; ranked mitigations.", "O", "Advisory only"],
      ["Engineering Documentation AI", "Design reports, calc summaries, method statements, memos, minutes.", "A", "External issue requires approval"],
      ["Engineering Estimation AI", "Quantities and engineering estimates from models and drawings.", "R", "All submitted prices"],
      ["Engineering Scheduling AI", "Design programme, deliverable schedules, resource loading.", "A", "Baseline changes"],
      ["Engineering Cost AI", "Design-to-cost tracking, value engineering opportunities.", "O", "Advisory only"],
      ["Engineering Procurement AI", "Keeps RFQs, POs and budgets aligned with every drawing revision.", "A", "PO changes above R500k"],
      ["Digital Twin Engineering AI", "Keeps the twin consistent with design: models, calcs, as-builts.", "A", "None — observational"],
      ["Engineering Analytics AI", "Discipline KPIs, review throughput, rework rates, benchmark trends.", "A", "None — reporting"],
    ],
  ),
  ...dept(
    "Manufacturing",
    ["Chief Manufacturing AI", "Digital factory manager: continuously asks if today's production could run better.", "O", "Plan changes need production manager"],
    [
      ["Production Planning AI", "Reads BOMs, capacity, labour and deadlines; proposes complete production plans.", "R", "Production manager approves plan"],
      ["Factory Operations AI", "Live shop-floor monitoring: throughput, bottlenecks, shift performance.", "A", "None — observational"],
      ["Industrial Engineering AI", "Line balancing, takt analysis, workflow and cell layout optimisation.", "O", "Advisory only"],
      ["Manufacturing Engineering AI", "Process selection, tooling, fixtures, manufacturability review.", "A", "Engineer sign-off"],
      ["CNC Programming AI", "Generates and verifies machine programs from fabrication models.", "R", "Machinist verifies before run"],
      ["Sheet Metal AI", "Unfolds, nests and sequences sheet work; bend allowances and tooling.", "A", "QA on first article"],
      ["Steel Fabrication AI", "Fab drawings, weld maps, assembly sequences for structural steel.", "A", "Fabrication manager releases"],
      ["Concrete Production AI", "Precast moulds, mix designs, curing schedules, yard logistics.", "A", "QA on mix changes"],
      ["Timber Manufacturing AI", "Timber components: cutting lists, lamination, treatment schedules.", "A", "QA on first article"],
      ["Modular Construction AI", "Volumetric module sequencing, fit-out lines, transport constraints.", "A", "Production manager approves"],
      ["Robotics AI", "Robot cell programs, path optimisation, cycle-time tuning.", "R", "Cell engineer verifies"],
      ["Machine Scheduling AI", "Allocates work across machines: capacity, tooling, changeovers, maintenance.", "A", "Schedule release by supervisor"],
      ["Capacity Planning AI", "Forward-load factories; flags capacity walls before they bind.", "O", "Advisory only"],
      ["Material Optimization AI", "Nesting, cut optimisation, offcut reuse, substitutions (with engineering approval).", "A", "Substitutions need engineering"],
      ["Procurement Manufacturing AI", "Keeps factory material supply aligned with production schedules.", "A", "POs above R500k"],
      ["Warehouse AI", "Factory stores: locations, picking, staging for production.", "A", "None — operational"],
      ["Inventory AI", "Stock levels, reservations, reorder points, obsolescence.", "A", "Write-offs need approval"],
      ["Logistics AI", "Inbound/outbound factory logistics and yard movements.", "A", "None — operational"],
      ["Shipping AI", "Delivery planning, load plans, transport booking to site.", "A", "None — operational"],
      ["Packaging AI", "Protection specs, crate design, handling instructions.", "A", "None — operational"],
      ["Quality AI", "In-process quality: certificates, welds, tolerances, finish; trend alerts.", "A", "NCR closure needs QA manager"],
      ["Inspection AI", "Inspection planning, checklists, dimensional verification from scans.", "A", "Hold-point release by QA"],
      ["Predictive Maintenance AI", "Vibration, temperature, runtime → remaining useful life and windows.", "O", "Maintenance manager schedules"],
      ["Factory Safety AI", "Machine guarding, permits, incidents, safety observations.", "A", "Always alerts humans"],
      ["Manufacturing Finance AI", "Cost per unit, contribution margin, factory profitability.", "O", "Advisory only"],
      ["Sustainability AI", "Energy, waste and carbon per work order; reduction opportunities.", "O", "Advisory only"],
      ["Supplier Collaboration AI", "Shares forecasts and drawings with suppliers; tracks confirmations.", "A", "External comms templates approved"],
      ["Cost Optimization AI", "Continuously asks: can we make this cheaper without violating spec?", "O", "Advisory with savings + assumptions"],
      ["Production Analytics AI", "OEE, utilisation, waste, on-time delivery dashboards.", "A", "None — reporting"],
      ["Manufacturing Documentation AI", "Work orders, packs, traceability, certificates, shipping docs.", "A", "Certificates need QA sign-off"],
    ],
  ),
  ...dept(
    "Construction",
    ["Chief Construction AI", "Digital construction director; ranked recommendations, never executes contractual changes.", "O", "Contractual actions always human"],
    [
      ["Program Management AI", "Portfolio-level programme health, dependencies, resource conflicts.", "O", "Advisory only"],
      ["Project Management AI", "Execution plans, milestones, health scores, weekly reports, delay prediction.", "A", "External comms need PM approval"],
      ["Site Management AI", "Daily works, crews, deliveries, weather, diaries; auto daily reports.", "A", "Site instructions need site manager"],
      ["Construction Planning AI", "Methodologies, sequences, staging, crane and logistics strategy; simulates options.", "O", "Planner adopts strategy"],
      ["Scheduler AI", "Dynamic programme: recalculates float, critical path, recovery scenarios.", "A", "Baseline changes need approval"],
      ["Cost Control AI", "Budget vs committed vs actual; trend and variance alerts.", "A", "None — reporting"],
      ["Commercial AI", "Contract obligations, notices, entitlements, commercial positions.", "O", "Commercial manager approval"],
      ["Quantity Surveyor AI", "Measurement, valuations, payment certificates, final account forecast.", "R", "QS certifies all valuations"],
      ["Procurement Coordination AI", "Aligns deliveries with site progress; warns on late materials.", "A", "Delivery changes with PM"],
      ["Subcontractor AI", "Subcontractor performance, claims exposure, interface management.", "O", "Advisory only"],
      ["Labour Management AI", "Crews, skills, certifications, productivity, legal constraints.", "A", "Crew moves with site manager"],
      ["Equipment Management AI", "Cranes to compressors: utilisation, fuel, maintenance, rentals.", "A", "Rental commitments need approval"],
      ["Plant Management AI", "Fixed plant: batching, hoists, tower cranes; availability windows.", "A", "None — operational"],
      ["Site Logistics AI", "Laydown, routes, gate schedules, traffic management.", "A", "None — operational"],
      ["Temporary Works AI", "Falsework, formwork, propping schemes; flags design checks needed.", "O", "Temporary works engineer approval"],
      ["Site Engineering AI", "Setting out data, field queries, construction detail support.", "A", "Engineer sign-off on details"],
      ["Surveying AI", "Survey control, as-built capture, deviation reports from scans.", "A", "None — observational"],
      ["Quality Control AI", "ITPs, hold points, concrete/weld records, close-out status.", "A", "Hold-point release by QA"],
      ["Inspection AI", "Schedules and tracks inspections; auto-raises defects from failures.", "A", "Defect closure needs QA"],
      ["Safety AI", "Permits, incidents, hazards, method statements; supports professionals.", "A", "Always alerts humans"],
      ["Environmental AI", "Dust, noise, water, waste compliance against conditions.", "A", "Filings need approval"],
      ["Permit Management AI", "Every permit and approval: status, expiry, conditions.", "A", "Applications need sign-off"],
      ["Risk Management AI", "Continuous risk scan: probability, severity, mitigation, confidence.", "O", "Advisory only"],
      ["Claims & Variations AI", "Evidence trails, EOT and variation drafts, commercial impact estimates.", "R", "All claims reviewed by commercial"],
      ["Construction Documentation AI", "Daily/weekly/monthly reports, minutes, close-out documentation.", "A", "External issue needs approval"],
      ["Commissioning AI", "System completion, test tracking, energisation readiness.", "A", "Energisation always human"],
      ["Handover AI", "O&M manuals, warranties, as-builts, training records assembly.", "A", "Client issue needs PM"],
      ["Facilities Transition AI", "Bridge to operations: twin handover, maintenance regimes.", "A", "None — coordination"],
      ["Construction Analytics AI", "CPI, SPI, earned value, productivity dashboards with explanations.", "A", "None — reporting"],
    ],
  ),
  ...dept(
    "Procurement",
    ["Chief Procurement AI", "Procurement director: what to buy today, what to delay, what is becoming a risk.", "O", "Awards and commitments always human"],
    [
      ["Strategic Sourcing AI", "Market analysis, sourcing strategies, single/dual-source trade-offs.", "O", "Sourcing strategy adopted by CPO"],
      ["Category Management AI", "Category strategies, preferred suppliers, framework agreements.", "O", "Advisory only"],
      ["Supplier Intelligence AI", "Complete supplier profiles, scoring, recommendation by requirement.", "A", "None — intelligence"],
      ["Supplier Risk AI", "Financial distress, disruption, concentration; early alternatives.", "O", "Advisory only"],
      ["Supplier Performance AI", "On-time, quality, responsiveness scoring from delivery history.", "A", "None — scoring"],
      ["RFQ Management AI", "Complete RFQ packages: specs, drawings, BoQ, terms, deadlines.", "A", "Issue after buyer review"],
      ["Tender Evaluation AI", "Weighted evaluation matrices with reasoning; never selects alone.", "O", "Award always human"],
      ["Contract Management AI", "Milestones, expiries, guarantees, retention, penalty tracking.", "A", "Amendments need approval"],
      ["Purchase Order AI", "Validates budget, authority, pricing, tax, Incoterms; issues after approval.", "R", "POs above R500k; all validations logged"],
      ["Inventory AI", "Stock, reservations, safety stock, reorder points across sites.", "A", "Write-offs need approval"],
      ["Warehouse AI", "Every pallet, batch and serial; receiving, dispatch, cycle counts.", "A", "None — operational"],
      ["Demand Forecasting AI", "Future demand from schedules, history, seasonality; shortage prediction.", "O", "Advisory only"],
      ["Material Planning AI", "Requirements, reorder points, MOQs, approved substitutions.", "A", "Substitutions need engineering"],
      ["Cost Optimisation AI", "Bulk discounts, timing, consolidation; savings with assumptions.", "O", "Advisory with savings estimates"],
      ["Spend Analytics AI", "Spend cubes, tail spend, leakage, savings tracking.", "A", "None — reporting"],
      ["Logistics AI", "Road, rail, sea, air; route optimisation within constraints.", "A", "Bookings above threshold"],
      ["Import & Export AI", "Customs, duties, documentation, port milestone tracking.", "A", "Filings need clearing agent"],
      ["Commercial Procurement AI", "Terms, guarantees, insurances on procurement contracts.", "O", "Commercial manager approval"],
      ["Engineering Procurement AI", "Traceability from every drawing revision to RFQs, POs, budgets.", "A", "PO changes above R500k"],
      ["Manufacturing Procurement AI", "Factory material supply aligned to production schedules.", "A", "POs above R500k"],
      ["Construction Procurement AI", "Deliveries matched to site progress and storage; prevents early/late.", "A", "Delivery changes with PM"],
      ["Vendor Compliance AI", "B-BBEE, tax, insurance, certification currency for every vendor.", "A", "Delisting needs approval"],
      ["Quality Procurement AI", "Incoming inspection requirements, certificates, supplier NCRs.", "A", "NCR closure by QA"],
      ["Invoice Matching AI", "Three-way match: PO, GRN, invoice; exceptions for review. Never approves payment.", "A", "Payment always authorized human"],
      ["Payment Coordination AI", "Payment batches, discount capture, terms optimisation.", "R", "Finance releases payments"],
      ["Procurement Documentation AI", "RFQ packs, comparison schedules, award records, audit trails.", "A", "None — documentation"],
      ["Procurement Analytics AI", "Cycle time, OTD, savings, match rate dashboards with causes.", "A", "None — reporting"],
    ],
  ),
  ...dept(
    "Finance",
    ["CFO AI", "Digital CFO: continuously asks how to improve profit, cash, and capital allocation.", "O", "All financial commitments human"],
    [
      ["Financial Controller AI", "Close process, controls, reconciliations, policy compliance.", "A", "Journal approval by controller"],
      ["Corporate Accounting AI", "General ledger, consolidations, statutory reporting prep.", "A", "Statements signed by humans"],
      ["Project Accounting AI", "Per-project P&L, committed/actual/forecast, margin alerts.", "A", "None — reporting"],
      ["Cost Accounting AI", "Cost drivers, waste, margin erosion across operations.", "O", "Advisory only"],
      ["Management Accounting AI", "Departmental performance, allocations, contribution analysis.", "A", "None — reporting"],
      ["FP&A AI", "Rolling 12/24/60-month forecasts, unlimited what-if simulation.", "O", "Scenarios advisory"],
      ["Treasury AI", "Liquidity, debt, facilities, FX positioning. Never executes transfers.", "O", "All transfers human"],
      ["Cash Flow AI", "Daily to annual cash forecasting; predicts shortfalls early.", "A", "None — forecasting"],
      ["Budgeting AI", "Budget builds, phasing, variance monitoring.", "R", "Budget adoption by owners"],
      ["Forecasting AI", "Revenue, expense and capital forecasts with confidence scores.", "A", "None — forecasting"],
      ["Payroll AI", "Payroll prep, anomaly detection, statutory calculations.", "R", "Payroll release by HR + finance"],
      ["Tax AI", "VAT, income tax, provisional prep; planning flagged for professionals.", "R", "All filings professionally reviewed"],
      ["Accounts Payable AI", "Invoice processing, duplicates, discount capture, batch prep.", "A", "Payment release authorized human"],
      ["Accounts Receivable AI", "Invoicing, collections priorities, late-payment prediction.", "A", "Customer comms after review"],
      ["Credit Control AI", "Credit limits, exposure, hold recommendations.", "R", "Limits set by credit manager"],
      ["Asset Management AI", "Asset registers, utilisation, lifecycle costs.", "A", "None — registry"],
      ["Fixed Asset AI", "Capitalisation, depreciation, impairment indicators.", "A", "Impairments need controller"],
      ["Capital Expenditure AI", "ROI, NPV, IRR, payback, sensitivity for every proposed investment.", "O", "Investment committee decides"],
      ["Investment Analysis AI", "Business cases for acquisitions, plant, technology, land.", "O", "Board decides"],
      ["Funding AI", "Facility utilisation, covenant headroom, funding requirement forecasts.", "O", "Advisory only"],
      ["Banking AI", "Bank account structures, fees, reconciliation exceptions.", "A", "Mandates always human"],
      ["Commercial Finance AI", "Pricing support, bid economics, contract financial terms.", "O", "Commercial approval"],
      ["Procurement Finance AI", "Commitments, commodity exposure, purchase timing economics.", "O", "Advisory only"],
      ["Manufacturing Finance AI", "Factory and machine profitability, cost per unit trends.", "O", "Advisory only"],
      ["Construction Finance AI", "Earned value, CPI/SPI, retention, claims, completion margin forecast.", "A", "None — reporting"],
      ["Risk Finance AI", "Liquidity, credit, currency, commodity, project risk scan.", "O", "Advisory only"],
      ["Audit AI", "Continuous controls monitoring, anomalies, fraud indicators, audit evidence.", "A", "Findings reviewed by audit"],
      ["Compliance AI", "Financial regulation, policy adherence, reporting obligations.", "A", "Filings need sign-off"],
      ["Insurance AI", "Cover adequacy, renewals, claims tracking, premium optimisation.", "O", "Broker/CFO decide"],
      ["Currency Risk AI", "FX exposure by project and currency; hedging recommendations.", "O", "Treasury executes"],
      ["Financial Documentation AI", "Board packs, management accounts, lender reports drafting.", "A", "Release after CFO review"],
      ["Executive Reporting AI", "Dashboards for CEO, board, investors, banks with commentary.", "A", "None — reporting"],
      ["Financial Analytics AI", "Trend, driver and benchmark analytics across the enterprise.", "A", "None — reporting"],
    ],
  ),
  ...dept(
    "Executive",
    ["CEO AI", "Strategic coordinator: monitors the whole business, never approves legally binding actions.", "O", "All strategy decisions human"],
    [
      ["COO AI", "Operations across construction, manufacturing, engineering, logistics.", "O", "Operational changes with directors"],
      ["CTO AI", "Platform health, security, scalability, technical roadmap.", "A", "Production changes gated"],
      ["CMO AI", "Brand, campaigns, content, acquisition analytics.", "R", "Publishing needs approval"],
      ["CRO AI", "Revenue, pricing, pipeline, customer success coordination.", "O", "Pricing decisions human"],
      ["CHRO AI", "Workforce planning, competency tracking, knowledge management.", "R", "People decisions always human"],
      ["CLO AI", "Contracts, legal risk, compliance, claims oversight. Everything reviewed by counsel.", "O", "All legal output counsel-reviewed"],
      ["AI Board", "Governance layer: stress-tests executive AI recommendations into board-quality briefings. Decides nothing.", "O", "Produces briefings only"],
    ],
  ),
];

// ─── War Room: the morning briefing ─────────────────────────────────────────

export const warRoomStats = {
  analyses: 42,
  risksFound: 7,
  draftsPrepared: 18,
  forecastsUpdated: 3,
  savingsFound: 1_300_000,
  approvalsWaiting: 12,
};

export interface WarRoomItem {
  priority: number;
  kind: "Decision" | "Risk" | "Opportunity" | "Completed";
  title: string;
  detail: string;
  source: string;
  impact: string;
}

export const warRoom: WarRoomItem[] = [
  {
    priority: 1,
    kind: "Decision",
    title: "Authorize alternative curtain wall fabricator for Sandton Gate",
    detail:
      "Meridian Façades lead time drift puts Levels 18–24 on the critical path from 14 Sep. Two pre-qualified alternatives quoted inside benchmark; re-sequencing fit-out buys 3 weeks.",
    source: "Chief Construction AI + Procurement AI",
    impact: "Protects completion date · est. R4.1m delay cost avoided",
  },
  {
    priority: 2,
    kind: "Decision",
    title: "Approve interim valuation approach for Cape Winelands milestone 4",
    detail:
      "Stormwater redesign defers a R34m certificate past quarter close, dropping cash cover below the 1.6× floor in October. Client QS open to an interim valuation.",
    source: "CFO AI + Quantity Surveyor AI",
    impact: "Keeps cash cover above policy floor",
  },
  {
    priority: 3,
    kind: "Risk",
    title: "Groundwater rising at platform 4 borehole BH-07",
    detail:
      "Level rose 0.6m in 10 days against a falling seasonal norm. Earthworks in that zone start in 3 weeks; dewatering lead time is 2 weeks.",
    source: "Digital Twin Engineering AI + Geotechnical AI",
    impact: "Order dewatering now or accept 2-week exposure",
  },
  {
    priority: 4,
    kind: "Opportunity",
    title: "Steel purchase window: prices down 6% over two weeks",
    detail:
      "Commodity curve and two upcoming orders suggest delaying PRJ-0163 rebar award ~10 days. Confidence 74%; assumes supplier capacity holds.",
    source: "Strategic Sourcing AI + Cost Optimisation AI",
    impact: "Est. R2.4m saving",
  },
  {
    priority: 5,
    kind: "Completed",
    title: "18 documents drafted overnight and queued for review",
    detail:
      "Weekly client reports (5), method statements (3), RFI responses (6), valuation support packs (4). All awaiting the responsible owner's approval.",
    source: "Documentation AIs",
    impact: "Est. 31 hours of drafting time saved",
  },
];

export const warRoomQuestions = [
  "What is the biggest risk to finishing Sandton Gate by 26 February?",
  "Which three actions would recover the most schedule this week?",
  "If we authorize overtime this week, what is the cost and schedule benefit?",
  "What happens if the PRJ-0163 rebar package is delayed one week?",
];

// ─── AI Board briefing ──────────────────────────────────────────────────────

export const boardBriefing = {
  proposal: "Open a second modular fabrication line at ModuFab Epping to serve healthcare pipeline",
  positions: [
    { agent: "CEO AI", position: "Strategically aligned — healthcare pipeline is R470m+ and modular win rate is 2× conventional." },
    { agent: "CFO AI", position: "Financially attractive at 19% est. ROI, 3.1-year payback; requires R48m capex from the 2027 envelope." },
    { agent: "COO AI", position: "Operationally feasible — ModuFab booked to Nov but line 2 commissioning fits Q1 2027." },
    { agent: "Risk AI", position: "Moderate: demand concentration on two public-sector clients; capex recovery sensitive to award timing." },
    { agent: "CLO AI", position: "Factory lease amendment and OHS certification required before commissioning." },
  ],
  agreement: "All executive agents agree the market opportunity is real and capacity is the binding constraint.",
  disagreement: "CFO AI and Risk AI differ on demand certainty: 74% vs 58% probability of both anchor awards landing in H1 2027.",
  questions: [
    "Can either anchor client commit to a framework volume before capex approval?",
    "Is a phased line (R29m first tranche) viable if awards slip two quarters?",
    "What is the exit cost if healthcare demand does not materialise?",
  ],
};

// ─── Generative design queue ────────────────────────────────────────────────

export interface DrawingJob {
  id: string;
  title: string;
  type: "Floor plan" | "Structural GA" | "Mechanical layout" | "Electrical SLD" | "HVAC ducting" | "Fabrication drawing";
  project: string;
  agent: string;
  status: "Generated — awaiting engineer review" | "Generating" | "Approved & issued" | "Revisions requested";
  confidence: number;
}

export const drawingJobs: DrawingJob[] = [
  { id: "GEN-0442", title: "Level 2 clinical floor plan — Rev A", type: "Floor plan", project: "PRJ-0170", agent: "Building Services AI", status: "Generated — awaiting engineer review", confidence: 0.86 },
  { id: "GEN-0439", title: "Transfer level structural GA — Rev C", type: "Structural GA", project: "PRJ-0142", agent: "Structural Engineering AI", status: "Approved & issued", confidence: 0.91 },
  { id: "GEN-0445", title: "Plantroom mechanical layout — Rev A", type: "Mechanical layout", project: "PRJ-0170", agent: "Mechanical Engineering AI", status: "Generating", confidence: 0 },
  { id: "GEN-0437", title: "MV single-line diagram — array field A", type: "Electrical SLD", project: "PRJ-0163", agent: "Electrical Engineering AI", status: "Generated — awaiting engineer review", confidence: 0.83 },
  { id: "GEN-0433", title: "Theatre wing HVAC ducting — Rev B", type: "HVAC ducting", project: "PRJ-0170", agent: "HVAC Engineering AI", status: "Revisions requested", confidence: 0.78 },
  { id: "GEN-0441", title: "Steel node fabrication set — grid C/12", type: "Fabrication drawing", project: "PRJ-0142", agent: "Steel Fabrication AI", status: "Generated — awaiting engineer review", confidence: 0.88 },
];

// ─── Simulation & intelligence engines ──────────────────────────────────────

export interface Scenario {
  question: string;
  answer: string;
  confidence: number;
  assumptions: string;
}

export const mfgScenarios: Scenario[] = [
  {
    question: "Move theatre pod production from ModuFab Epping to Vulcan Works 2?",
    answer:
      "Duration +9 days (tooling transfer), cost −R1.8m (labour rates), delivery date holds only if transfer starts within 5 days. Logistics +R240k, quality risk moderate on first two units.",
    confidence: 0.72,
    assumptions: "Vulcan capacity confirmed; jig transfer 4 days; no design changes during transfer.",
  },
  {
    question: "Add a second shift at Vulcan Works 2 for the transfer-steel package?",
    answer:
      "Throughput +38%, unit cost +6% (shift premium), delivery pulls forward 11 days, machine utilisation rises to 91%. Recommended only if curtain wall re-sequencing is approved — otherwise steel waits on site.",
    confidence: 0.81,
    assumptions: "Operator availability for night shift; maintenance window preserved Sundays.",
  },
];

export const procIntel: Scenario[] = [
  {
    question: "Steel pricing window",
    answer:
      "Steel down 6% in two weeks. Delaying the PRJ-0163 rebar award ~10 days could reduce material cost by est. R2.4m.",
    confidence: 0.74,
    assumptions: "Current supplier availability holds; project schedule stable.",
  },
  {
    question: "Supplier delivery risk",
    answer:
      "Meridian Façades has delivered late on 3 of the last 5 orders. High probability the L18–L24 delivery misses the required date — alternatives already quoted inside benchmark.",
    confidence: 0.87,
    assumptions: "Past performance predictive; no capacity change disclosed.",
  },
  {
    question: "Shipment consolidation",
    answer:
      "Consolidating four open POs into one KZN shipment is estimated to reduce logistics costs by 12% (≈R310k) with no schedule impact.",
    confidence: 0.9,
    assumptions: "Delivery windows within same week; site storage available.",
  },
];

export const financeBrain: Scenario[] = [
  {
    question: "Sandton Gate margin recovery",
    answer:
      "Forecast margin 8.4% vs 12.0% tendered. Three actions could recover est. R14.2m: approve façade alternative (R4.1m delay cost avoided), re-price VO-088 stone scope (R3.6m), accelerate certificate cycle (R6.5m financing cost).",
    confidence: 0.77,
    assumptions: "Client accepts interim valuation; alternative fabricator passes QA.",
  },
  {
    question: "Cash position — 63-day outlook",
    answer:
      "Potential shortfall in 63 days under current payment schedule. Options: accelerate receivables from three clients (R41m), delay non-critical capex (R12m), or draw standby facility (cost R180k/quarter).",
    confidence: 0.82,
    assumptions: "No new awards before October; current burn holds.",
  },
];
