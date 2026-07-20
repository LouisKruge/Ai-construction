// Central mock data layer. Every module reads from this single source of
// truth, mirroring the platform's shared-knowledge-graph architecture.
// Replace with API calls when the backend lands.

export type ProjectStatus = "On track" | "At risk" | "Delayed" | "Tender";
export type ProjectPhase =
  | "Concept"
  | "Engineering"
  | "Procurement"
  | "Manufacturing"
  | "Construction"
  | "Handover";

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  sector: string;
  phase: ProjectPhase;
  status: ProjectStatus;
  budget: number; // ZAR
  committed: number;
  spent: number;
  progress: number; // 0-100 planned vs actual basis
  plannedProgress: number;
  startDate: string;
  endDate: string;
  riskScore: number; // 0-100
  openRfis: number;
  openDefects: number;
}

export const projects: Project[] = [
  {
    id: "PRJ-0142",
    name: "Sandton Gate Mixed-Use Tower",
    client: "Redstone Property Group",
    location: "Johannesburg, GP",
    sector: "Commercial",
    phase: "Construction",
    status: "At risk",
    budget: 486_000_000,
    committed: 371_000_000,
    spent: 268_400_000,
    progress: 54,
    plannedProgress: 61,
    startDate: "2025-03-10",
    endDate: "2027-02-26",
    riskScore: 68,
    openRfis: 14,
    openDefects: 23,
  },
  {
    id: "PRJ-0151",
    name: "N3 Cato Ridge Interchange Upgrade",
    client: "SANRAL",
    location: "KwaZulu-Natal",
    sector: "Roads & Civil",
    phase: "Construction",
    status: "On track",
    budget: 912_000_000,
    committed: 705_000_000,
    spent: 512_300_000,
    progress: 58,
    plannedProgress: 57,
    startDate: "2024-11-04",
    endDate: "2027-08-13",
    riskScore: 31,
    openRfis: 6,
    openDefects: 9,
  },
  {
    id: "PRJ-0163",
    name: "Richards Bay 140MW Solar PV",
    client: "Meridian Energy Partners",
    location: "KwaZulu-Natal",
    sector: "Renewable Energy",
    phase: "Procurement",
    status: "On track",
    budget: 1_640_000_000,
    committed: 388_000_000,
    spent: 96_500_000,
    progress: 12,
    plannedProgress: 11,
    startDate: "2026-02-02",
    endDate: "2028-05-30",
    riskScore: 42,
    openRfis: 3,
    openDefects: 0,
  },
  {
    id: "PRJ-0158",
    name: "Cape Winelands Logistics Park — Phase 2",
    client: "Atterfield Developments",
    location: "Paarl, WC",
    sector: "Industrial",
    phase: "Engineering",
    status: "Delayed",
    budget: 238_000_000,
    committed: 41_000_000,
    spent: 18_200_000,
    progress: 7,
    plannedProgress: 15,
    startDate: "2026-01-12",
    endDate: "2027-06-18",
    riskScore: 74,
    openRfis: 11,
    openDefects: 0,
  },
  {
    id: "PRJ-0170",
    name: "Tygerberg Hospital Theatre Wing",
    client: "Western Cape DOI",
    location: "Cape Town, WC",
    sector: "Healthcare",
    phase: "Manufacturing",
    status: "On track",
    budget: 356_000_000,
    committed: 214_000_000,
    spent: 121_700_000,
    progress: 33,
    plannedProgress: 32,
    startDate: "2025-08-18",
    endDate: "2027-04-09",
    riskScore: 27,
    openRfis: 4,
    openDefects: 2,
  },
  {
    id: "PRJ-0177",
    name: "Waterfall City Data Centre Campus",
    client: "Nexus Digital Infrastructure",
    location: "Midrand, GP",
    sector: "Data Centres",
    phase: "Concept",
    status: "Tender",
    budget: 2_100_000_000,
    committed: 0,
    spent: 3_800_000,
    progress: 0,
    plannedProgress: 0,
    startDate: "2026-10-01",
    endDate: "2029-03-30",
    riskScore: 38,
    openRfis: 0,
    openDefects: 0,
  },
];

export interface Insight {
  id: string;
  severity: "critical" | "caution" | "info";
  agent: string;
  project: string;
  title: string;
  detail: string;
  action: string;
  confidence: number; // 0-1
}

export const insights: Insight[] = [
  {
    id: "INS-981",
    severity: "critical",
    agent: "Delay Predictor",
    project: "PRJ-0142",
    title: "Curtain wall delivery slippage threatens Level 18–24 sequence",
    detail:
      "Façade supplier lead time has drifted from 6 to 11 weeks across the last three POs. Current sequence puts curtain wall on the critical path from 14 September.",
    action:
      "Re-sequence internal fit-out ahead of façade close-in and issue RFQ to two pre-qualified alternative fabricators.",
    confidence: 0.87,
  },
  {
    id: "INS-978",
    severity: "caution",
    agent: "Procurement Intelligence",
    project: "PRJ-0163",
    title: "Rebar pricing 8.4% above 90-day regional benchmark",
    detail:
      "Current preferred quote exceeds the KZN benchmark curve. Two qualified suppliers with capacity are pricing below benchmark this quarter.",
    action: "Reopen RFQ-2214 to benchmark-competitive suppliers before award.",
    confidence: 0.92,
  },
  {
    id: "INS-975",
    severity: "caution",
    agent: "Cashflow Forecaster",
    project: "PRJ-0158",
    title: "Engineering delay defers R34m certificate into next quarter",
    detail:
      "Stormwater redesign pushes milestone 4 valuation past quarter close, moving projected group cash cover below the 1.6× policy floor in October.",
    action:
      "Agree interim valuation with client QS or draw on standby facility; flag to CFO review.",
    confidence: 0.81,
  },
  {
    id: "INS-969",
    severity: "info",
    agent: "Compliance Engineer",
    project: "PRJ-0170",
    title: "SANS 10400-T fire compliance verified for revised theatre layout",
    detail:
      "Rev C layout passes automated fire-compliance checks; two advisory notes issued on door hardware scheduling.",
    action: "No action required. Advisory notes routed to architect.",
    confidence: 0.95,
  },
];

export interface Rfq {
  id: string;
  package: string;
  project: string;
  quotes: number;
  lowest: number;
  benchmark: number; // platform benchmark estimate
  status: "Open" | "Evaluating" | "Awarded" | "Draft";
  closes: string;
}

export const rfqs: Rfq[] = [
  {
    id: "RFQ-2214",
    package: "Reinforcing steel — Phase 1 arrays",
    project: "PRJ-0163",
    quotes: 5,
    lowest: 18_420_000,
    benchmark: 17_000_000,
    status: "Evaluating",
    closes: "2026-07-24",
  },
  {
    id: "RFQ-2217",
    package: "Curtain wall — Levels 18–32",
    project: "PRJ-0142",
    quotes: 2,
    lowest: 41_900_000,
    benchmark: 43_500_000,
    status: "Open",
    closes: "2026-07-31",
  },
  {
    id: "RFQ-2211",
    package: "Medical gas reticulation",
    project: "PRJ-0170",
    quotes: 4,
    lowest: 12_260_000,
    benchmark: 12_100_000,
    status: "Awarded",
    closes: "2026-07-10",
  },
  {
    id: "RFQ-2220",
    package: "Bulk earthworks — platform 4",
    project: "PRJ-0158",
    quotes: 0,
    lowest: 0,
    benchmark: 9_800_000,
    status: "Draft",
    closes: "2026-08-08",
  },
];

export interface Supplier {
  name: string;
  category: string;
  onTimeRate: number;
  qualityScore: number;
  activeOrders: number;
  spendYtd: number;
}

export const suppliers: Supplier[] = [
  { name: "Vulcan Steel Fabricators", category: "Structural steel", onTimeRate: 0.96, qualityScore: 4.7, activeOrders: 7, spendYtd: 84_200_000 },
  { name: "Karoo Ready-Mix", category: "Concrete", onTimeRate: 0.91, qualityScore: 4.4, activeOrders: 12, spendYtd: 56_900_000 },
  { name: "Meridian Façades", category: "Curtain wall", onTimeRate: 0.72, qualityScore: 4.1, activeOrders: 3, spendYtd: 38_400_000 },
  { name: "Drakensberg Electrical", category: "Electrical", onTimeRate: 0.94, qualityScore: 4.6, activeOrders: 9, spendYtd: 47_100_000 },
  { name: "Cape Formwork Systems", category: "Formwork & scaffolding", onTimeRate: 0.88, qualityScore: 4.2, activeOrders: 6, spendYtd: 21_800_000 },
];

export interface EngReview {
  id: string;
  drawing: string;
  project: string;
  discipline: string;
  revision: string;
  status: "Passed" | "Issues found" | "In review" | "Queued";
  findings: number;
  reviewer: string;
}

export const engReviews: EngReview[] = [
  { id: "DRW-4415", drawing: "S-1802 — Level 18 transfer slab", project: "PRJ-0142", discipline: "Structural", revision: "Rev D", status: "Issues found", findings: 3, reviewer: "Structural Review Agent" },
  { id: "DRW-4409", drawing: "C-0234 — Stormwater attenuation", project: "PRJ-0158", discipline: "Civil", revision: "Rev B", status: "Issues found", findings: 5, reviewer: "Drainage Review Agent" },
  { id: "DRW-4421", drawing: "E-0871 — Theatre UPS reticulation", project: "PRJ-0170", discipline: "Electrical", revision: "Rev C", status: "Passed", findings: 0, reviewer: "Electrical Review Agent" },
  { id: "DRW-4424", drawing: "M-0455 — HVAC plantroom layout", project: "PRJ-0170", discipline: "Mechanical", revision: "Rev A", status: "In review", findings: 0, reviewer: "HVAC Review Agent" },
  { id: "DRW-4427", drawing: "S-0120 — PV tracker foundations", project: "PRJ-0163", discipline: "Structural", revision: "Rev A", status: "Queued", findings: 0, reviewer: "Geotechnical Review Agent" },
];

export interface ScheduleItem {
  activity: string;
  project: string;
  start: string;
  end: string;
  progress: number;
  critical: boolean;
  float: number; // days
}

export const schedule: ScheduleItem[] = [
  { activity: "Core jump-form to L26", project: "PRJ-0142", start: "2026-06-15", end: "2026-09-04", progress: 46, critical: true, float: 0 },
  { activity: "Curtain wall install L10–L17", project: "PRJ-0142", start: "2026-07-06", end: "2026-10-16", progress: 18, critical: true, float: 0 },
  { activity: "Bridge deck post-tensioning", project: "PRJ-0151", start: "2026-07-13", end: "2026-08-21", progress: 35, critical: true, float: 0 },
  { activity: "Theatre modular pods — factory QA", project: "PRJ-0170", start: "2026-07-01", end: "2026-08-28", progress: 52, critical: false, float: 12 },
  { activity: "Stormwater redesign approval", project: "PRJ-0158", start: "2026-06-22", end: "2026-08-07", progress: 61, critical: true, float: 0 },
  { activity: "PV module logistics plan", project: "PRJ-0163", start: "2026-08-03", end: "2026-09-11", progress: 0, critical: false, float: 24 },
];

export interface CashflowMonth {
  month: string;
  inflow: number; // ZAR millions
  outflow: number;
}

export const cashflow: CashflowMonth[] = [
  { month: "Jul", inflow: 148, outflow: 131 },
  { month: "Aug", inflow: 162, outflow: 149 },
  { month: "Sep", inflow: 141, outflow: 156 },
  { month: "Oct", inflow: 133, outflow: 152 },
  { month: "Nov", inflow: 186, outflow: 158 },
  { month: "Dec", inflow: 171, outflow: 144 },
];

export interface WorkOrder {
  id: string;
  item: string;
  project: string;
  factory: string;
  qty: string;
  due: string;
  progress: number;
  status: "In production" | "QA" | "Shipped" | "Queued";
}

export const workOrders: WorkOrder[] = [
  { id: "WO-0881", item: "Theatre modular pods (type B)", project: "PRJ-0170", factory: "ModuFab Epping", qty: "8 units", due: "2026-08-28", progress: 52, status: "In production" },
  { id: "WO-0874", item: "Transfer-level steel assemblies", project: "PRJ-0142", factory: "Vulcan Works 2", qty: "112 t", due: "2026-08-14", progress: 78, status: "QA" },
  { id: "WO-0869", item: "Precast bridge parapets", project: "PRJ-0151", factory: "Karoo Precast", qty: "340 lm", due: "2026-07-25", progress: 100, status: "Shipped" },
  { id: "WO-0890", item: "PV tracker piles (batch 1)", project: "PRJ-0163", factory: "Vulcan Works 1", qty: "2 400 units", due: "2026-10-02", progress: 0, status: "Queued" },
];

export const fmt = {
  zar(n: number): string {
    if (n >= 1_000_000_000) return `R${(n / 1_000_000_000).toFixed(2)}bn`;
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}m`;
    if (n >= 1_000) return `R${(n / 1_000).toFixed(0)}k`;
    return `R${n.toFixed(0)}`;
  },
  pct(n: number): string {
    return `${Math.round(n * 100)}%`;
  },
};
