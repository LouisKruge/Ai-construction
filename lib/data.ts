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

// ─── Design & BIM ───────────────────────────────────────────────────────────

export interface DesignPackage {
  id: string;
  name: string;
  project: string;
  stage: "Concept" | "Schematic" | "Detailed" | "Tender" | "IFC";
  architect: string;
  drawings: number;
  approved: number;
  status: "In progress" | "Client review" | "Approved" | "On hold";
}

export const designPackages: DesignPackage[] = [
  { id: "DP-201", name: "Tower façade & envelope", project: "PRJ-0142", stage: "IFC", architect: "Studio Mokoena", drawings: 84, approved: 79, status: "In progress" },
  { id: "DP-207", name: "Theatre wing — clinical layouts", project: "PRJ-0170", stage: "Detailed", architect: "HealthArc Partners", drawings: 46, approved: 46, status: "Approved" },
  { id: "DP-212", name: "Logistics park — warehouse shells", project: "PRJ-0158", stage: "Schematic", architect: "Bastion Design", drawings: 22, approved: 9, status: "Client review" },
  { id: "DP-215", name: "Data centre campus masterplan", project: "PRJ-0177", stage: "Concept", architect: "Studio Mokoena", drawings: 14, approved: 3, status: "In progress" },
];

export interface ClashSet {
  id: string;
  project: string;
  disciplines: string;
  zone: string;
  clashes: number;
  resolved: number;
  status: "Open" | "In review" | "Resolved";
}

export const clashSets: ClashSet[] = [
  { id: "CL-118", project: "PRJ-0142", disciplines: "Structure × HVAC", zone: "L18 plantroom", clashes: 31, resolved: 22, status: "Open" },
  { id: "CL-121", project: "PRJ-0170", disciplines: "Medical gas × Electrical", zone: "Theatre 3–5 ceiling void", clashes: 12, resolved: 12, status: "Resolved" },
  { id: "CL-124", project: "PRJ-0142", disciplines: "Façade × Structure", zone: "L24 transfer", clashes: 7, resolved: 2, status: "In review" },
  { id: "CL-126", project: "PRJ-0158", disciplines: "Civils × Wet services", zone: "Platform 4 services corridor", clashes: 19, resolved: 4, status: "Open" },
];

// ─── Quality ────────────────────────────────────────────────────────────────

export interface Defect {
  id: string;
  project: string;
  location: string;
  trade: string;
  description: string;
  severity: "Critical" | "Major" | "Minor";
  status: "Open" | "In progress" | "Ready for reinspection" | "Closed";
  due: string;
}

export const defects: Defect[] = [
  { id: "DEF-1204", project: "PRJ-0142", location: "L12 core lobby", trade: "Concrete", description: "Honeycombing to shear wall face, 1.2m² patch", severity: "Major", status: "In progress", due: "2026-07-28" },
  { id: "DEF-1211", project: "PRJ-0142", location: "L09 riser 2", trade: "Fire protection", description: "Missing firestopping at service penetrations", severity: "Critical", status: "Open", due: "2026-07-23" },
  { id: "DEF-1198", project: "PRJ-0151", location: "Pier 4", trade: "Formwork", description: "Surface finish outside F3 tolerance", severity: "Minor", status: "Ready for reinspection", due: "2026-07-22" },
  { id: "DEF-1187", project: "PRJ-0170", location: "Pod B3 (factory)", trade: "Joinery", description: "Door frame out of plumb 6mm", severity: "Minor", status: "Closed", due: "2026-07-15" },
  { id: "DEF-1215", project: "PRJ-0142", location: "L15 curtain wall", trade: "Glazing", description: "Failed water penetration test, unit CW-15-08", severity: "Major", status: "Open", due: "2026-07-30" },
];

export interface Inspection {
  id: string;
  project: string;
  type: string;
  date: string;
  inspector: string;
  result: "Passed" | "Failed" | "Scheduled";
  notes: string;
}

export const inspections: Inspection[] = [
  { id: "INSP-887", project: "PRJ-0142", type: "Concrete pre-pour — L26 core", date: "2026-07-21", inspector: "Site QA + Structural Agent checklist", result: "Scheduled", notes: "Rebar scan uploaded, awaiting cover verification" },
  { id: "INSP-882", project: "PRJ-0151", type: "Post-tension stressing record", date: "2026-07-18", inspector: "PT specialist", result: "Passed", notes: "Elongations within 4% of theoretical" },
  { id: "INSP-879", project: "PRJ-0170", type: "Modular pod factory QA — batch 2", date: "2026-07-17", inspector: "ModuFab QC", result: "Passed", notes: "2 minor snags logged to DEF register" },
  { id: "INSP-874", project: "PRJ-0142", type: "Curtain wall water test — L15", date: "2026-07-15", inspector: "Façade consultant", result: "Failed", notes: "Unit CW-15-08 leak at transom joint — DEF-1215 raised" },
];

// ─── Safety ─────────────────────────────────────────────────────────────────

export interface SafetyItem {
  id: string;
  project: string;
  type: "Near miss" | "First aid" | "Observation" | "Permit" | "Toolbox talk";
  description: string;
  date: string;
  status: "Open" | "Closed" | "Active";
}

export const safetyItems: SafetyItem[] = [
  { id: "SAF-3312", project: "PRJ-0142", type: "Near miss", description: "Unsecured scaffold tube fell 3 levels within exclusion zone", date: "2026-07-17", status: "Open" },
  { id: "SAF-3309", project: "PRJ-0151", type: "Permit", description: "Hot works — deck welding, bays 12–14", date: "2026-07-20", status: "Active" },
  { id: "SAF-3305", project: "PRJ-0142", type: "Toolbox talk", description: "Working at height refresher — 142 attendees", date: "2026-07-16", status: "Closed" },
  { id: "SAF-3301", project: "PRJ-0163", type: "Observation", description: "Dust suppression inadequate on haul road during NW wind", date: "2026-07-14", status: "Closed" },
  { id: "SAF-3298", project: "PRJ-0151", type: "First aid", description: "Laceration to hand — glove policy reinforced", date: "2026-07-11", status: "Closed" },
];

// ─── Documents, RFIs, variations ────────────────────────────────────────────

export interface Doc {
  id: string;
  name: string;
  project: string;
  type: string;
  version: string;
  size: string;
  uploaded: string;
  indexed: "Indexed" | "Processing" | "Queued";
}

export const documents: Doc[] = [
  { id: "DOC-9931", name: "Main contract — JBCC 6.2 signed", project: "PRJ-0142", type: "Contract", version: "1.0", size: "8.4 MB", uploaded: "2026-07-18", indexed: "Indexed" },
  { id: "DOC-9928", name: "Geotech report — platform 4 addendum", project: "PRJ-0158", type: "Report", version: "2.1", size: "22.7 MB", uploaded: "2026-07-17", indexed: "Indexed" },
  { id: "DOC-9925", name: "S-1802 transfer slab Rev D", project: "PRJ-0142", type: "Drawing", version: "D", size: "4.1 MB", uploaded: "2026-07-16", indexed: "Indexed" },
  { id: "DOC-9922", name: "PV module datasheets — 640W bifacial", project: "PRJ-0163", type: "Specification", version: "1.0", size: "12.3 MB", uploaded: "2026-07-15", indexed: "Processing" },
  { id: "DOC-9919", name: "Drone survey — week 29 orthomosaic", project: "PRJ-0151", type: "Survey", version: "—", size: "1.9 GB", uploaded: "2026-07-19", indexed: "Queued" },
];

export interface Rfi {
  id: string;
  project: string;
  subject: string;
  raisedBy: string;
  ballInCourt: string;
  due: string;
  status: "Open" | "Answered" | "Overdue";
}

export const rfis: Rfi[] = [
  { id: "RFI-0611", project: "PRJ-0142", subject: "Transfer slab penetration ≤300mm — sleeve detail", raisedBy: "Site engineer", ballInCourt: "Structural engineer", due: "2026-07-22", status: "Open" },
  { id: "RFI-0608", project: "PRJ-0158", subject: "Attenuation pond liner spec vs geotech addendum", raisedBy: "Contractor", ballInCourt: "Civil engineer", due: "2026-07-18", status: "Overdue" },
  { id: "RFI-0604", project: "PRJ-0170", subject: "Theatre pendant fixing to pod ceiling structure", raisedBy: "ModuFab", ballInCourt: "Architect", due: "2026-07-21", status: "Open" },
  { id: "RFI-0601", project: "PRJ-0142", subject: "Curtain wall bracket cast-in tolerance", raisedBy: "Meridian Façades", ballInCourt: "—", due: "2026-07-14", status: "Answered" },
];

export interface Variation {
  id: string;
  project: string;
  description: string;
  value: number;
  status: "Draft" | "Submitted" | "Approved" | "Rejected";
}

export const variations: Variation[] = [
  { id: "VO-088", project: "PRJ-0142", description: "Client upgrade — lobby stone finishes", value: 6_400_000, status: "Approved" },
  { id: "VO-091", project: "PRJ-0158", description: "Stormwater redesign — additional attenuation", value: 11_200_000, status: "Submitted" },
  { id: "VO-092", project: "PRJ-0151", description: "Rock excavation over-break, pier 6", value: 3_850_000, status: "Draft" },
  { id: "VO-086", project: "PRJ-0170", description: "Additional isolation room conversion", value: 8_900_000, status: "Approved" },
];

// ─── Sales & clients ────────────────────────────────────────────────────────

export interface Opportunity {
  id: string;
  name: string;
  client: string;
  sector: string;
  value: number;
  stage: "Qualifying" | "Proposal" | "Tender submitted" | "Negotiation" | "Won" | "Lost";
  winProbability: number;
  closes: string;
}

export const pipeline: Opportunity[] = [
  { id: "OPP-441", name: "Waterfall City Data Centre Campus", client: "Nexus Digital Infrastructure", sector: "Data Centres", value: 2_100_000_000, stage: "Tender submitted", winProbability: 0.35, closes: "2026-09-15" },
  { id: "OPP-438", name: "Umhlanga Ridge residential towers", client: "Coastal Living Group", sector: "Residential", value: 640_000_000, stage: "Proposal", winProbability: 0.45, closes: "2026-08-29" },
  { id: "OPP-433", name: "Gqeberha wind farm BOP", client: "Meridian Energy Partners", sector: "Renewable Energy", value: 890_000_000, stage: "Negotiation", winProbability: 0.7, closes: "2026-08-08" },
  { id: "OPP-429", name: "Lanseria warehouse & cold store", client: "Atterfield Developments", sector: "Industrial", value: 210_000_000, stage: "Qualifying", winProbability: 0.2, closes: "2026-10-02" },
  { id: "OPP-425", name: "Mthatha regional hospital upgrade", client: "Eastern Cape DOH", sector: "Healthcare", value: 470_000_000, stage: "Tender submitted", winProbability: 0.4, closes: "2026-09-01" },
];

export interface Client {
  name: string;
  contact: string;
  activeProjects: number;
  contracted: number;
  satisfaction: number; // 0-5
  lastReport: string;
  pendingApprovals: number;
}

export const clients: Client[] = [
  { name: "Redstone Property Group", contact: "N. Dlamini — Development Director", activeProjects: 1, contracted: 486_000_000, satisfaction: 3.9, lastReport: "2026-07-14", pendingApprovals: 2 },
  { name: "SANRAL", contact: "T. van Rooyen — Project Director", activeProjects: 1, contracted: 912_000_000, satisfaction: 4.6, lastReport: "2026-07-15", pendingApprovals: 0 },
  { name: "Meridian Energy Partners", contact: "S. Naidoo — Head of Delivery", activeProjects: 1, contracted: 1_640_000_000, satisfaction: 4.4, lastReport: "2026-07-11", pendingApprovals: 1 },
  { name: "Atterfield Developments", contact: "J. Botha — Portfolio Manager", activeProjects: 1, contracted: 238_000_000, satisfaction: 3.4, lastReport: "2026-07-08", pendingApprovals: 3 },
  { name: "Western Cape DOI", contact: "L. Petersen — Programme Lead", activeProjects: 1, contracted: 356_000_000, satisfaction: 4.7, lastReport: "2026-07-16", pendingApprovals: 0 },
];

// ─── Digital twin ───────────────────────────────────────────────────────────

export interface Sensor {
  id: string;
  project: string;
  type: string;
  location: string;
  value: string;
  status: "Normal" | "Warning" | "Alert" | "Offline";
  updated: string;
}

export const sensors: Sensor[] = [
  { id: "SEN-118", project: "PRJ-0142", type: "Concrete maturity", location: "L25 core pour C-2261", value: "31.4 MPa (est.)", status: "Normal", updated: "4 min ago" },
  { id: "SEN-104", project: "PRJ-0142", type: "Crane wind speed", location: "TC-2 jib", value: "38 km/h gusting", status: "Warning", updated: "1 min ago" },
  { id: "SEN-097", project: "PRJ-0151", type: "Deck deflection", location: "Span 3 midpoint", value: "12.1 mm", status: "Normal", updated: "9 min ago" },
  { id: "SEN-121", project: "PRJ-0163", type: "Pyranometer", location: "Met station 1", value: "6.2 kWh/m²/day", status: "Normal", updated: "2 min ago" },
  { id: "SEN-089", project: "PRJ-0170", type: "Pod transport shock", location: "Batch 1 in transit", value: "0.8 g peak", status: "Normal", updated: "16 min ago" },
  { id: "SEN-092", project: "PRJ-0158", type: "Groundwater level", location: "Borehole BH-07", value: "-2.4 m (rising)", status: "Alert", updated: "22 min ago" },
];

export interface TwinCapture {
  project: string;
  kind: string;
  date: string;
  coverage: string;
  delta: string;
}

export const twinCaptures: TwinCapture[] = [
  { project: "PRJ-0142", kind: "Laser scan — L10–L14", date: "2026-07-18", coverage: "98%", delta: "+2.1% vs plan, 3 deviations flagged" },
  { project: "PRJ-0151", kind: "Drone orthomosaic — full site", date: "2026-07-19", coverage: "100%", delta: "Earthworks 96% of design surface" },
  { project: "PRJ-0163", kind: "Drone survey — array field A", date: "2026-07-16", coverage: "100%", delta: "Pile layout matches design" },
  { project: "PRJ-0170", kind: "360° capture — theatre corridor", date: "2026-07-17", coverage: "91%", delta: "No deviations" },
];

// ─── Marketplace ────────────────────────────────────────────────────────────

export interface MarketListing {
  name: string;
  kind: "Supplier" | "Manufacturer" | "Equipment" | "Professional";
  category: string;
  region: string;
  rating: number;
  capacity: string;
  verified: boolean;
}

export const marketplace: MarketListing[] = [
  { name: "Vulcan Steel Fabricators", kind: "Manufacturer", category: "Structural steel · 900 t/month", region: "Gauteng", rating: 4.7, capacity: "34% available Q4", verified: true },
  { name: "Karoo Precast", kind: "Manufacturer", category: "Precast concrete elements", region: "Western Cape", rating: 4.5, capacity: "Available from Sep", verified: true },
  { name: "Highveld Crane Hire", kind: "Equipment", category: "Tower & mobile cranes to 350 t", region: "National", rating: 4.3, capacity: "2× luffing units free Aug", verified: true },
  { name: "Cape Formwork Systems", kind: "Supplier", category: "Formwork & scaffolding", region: "Western Cape", rating: 4.2, capacity: "Immediate", verified: true },
  { name: "Sithole & Partners", kind: "Professional", category: "Structural engineering — ECSA reg.", region: "KwaZulu-Natal", rating: 4.8, capacity: "120 h/month from Aug", verified: true },
  { name: "AeroSite Surveys", kind: "Professional", category: "Drone survey & photogrammetry", region: "National", rating: 4.6, capacity: "Immediate", verified: false },
  { name: "Ubuntu Electrical Wholesale", kind: "Supplier", category: "MV/LV switchgear & cable", region: "Gauteng", rating: 4.1, capacity: "Immediate", verified: true },
  { name: "ModuFab Epping", kind: "Manufacturer", category: "Volumetric modular units", region: "Western Cape", rating: 4.4, capacity: "Booked to Nov", verified: true },
];

// ─── Analytics benchmarks ───────────────────────────────────────────────────

export interface Benchmark {
  metric: string;
  company: string;
  industry: string;
  better: boolean;
}

export const benchmarks: Benchmark[] = [
  { metric: "Schedule adherence (portfolio)", company: "93%", industry: "81%", better: true },
  { metric: "Procurement savings vs budget", company: "4.2%", industry: "1.1%", better: true },
  { metric: "Rework as % of contract value", company: "2.3%", industry: "5.0%", better: true },
  { metric: "RFI response time (median)", company: "2.1 days", industry: "7.4 days", better: true },
  { metric: "Defects at practical completion / R100m", company: "38", industry: "112", better: true },
  { metric: "Forecast-at-completion accuracy", company: "±3.8%", industry: "±11%", better: true },
  { metric: "Margin erosion tender → final", company: "-0.8 pts", industry: "-3.2 pts", better: true },
];

// ─── Team ───────────────────────────────────────────────────────────────────

export interface TeamMember {
  name: string;
  role: string;
  email: string;
  access: "Admin" | "Editor" | "Viewer";
  lastActive: string;
}

export const team: TeamMember[] = [
  { name: "Louis Kruge", role: "Chief Executive", email: "louis@meridiancg.example", access: "Admin", lastActive: "Now" },
  { name: "Stefan Kruger", role: "Commercial Director", email: "stefan@meridiancg.example", access: "Admin", lastActive: "2 h ago" },
  { name: "A. Mahlangu", role: "Engineering Director", email: "a.mahlangu@meridiancg.example", access: "Editor", lastActive: "35 min ago" },
  { name: "P. Jacobs", role: "Construction Director", email: "p.jacobs@meridiancg.example", access: "Editor", lastActive: "1 h ago" },
  { name: "R. Singh", role: "Procurement Manager", email: "r.singh@meridiancg.example", access: "Editor", lastActive: "12 min ago" },
  { name: "M. van Wyk", role: "Client — Redstone", email: "m.vanwyk@redstone.example", access: "Viewer", lastActive: "Yesterday" },
];

// ─── AI Workforce ───────────────────────────────────────────────────────────

export interface Agent {
  name: string;
  department: string;
  purpose: string;
  inputs: string;
  outputs: string;
  autonomy: "Autonomous within limits" | "Recommends only" | "Requires approval";
  approvalGate: string;
  actions30d: number;
  acceptRate: number; // 0-1, share of recommendations accepted
  status: "Active" | "Paused";
}

export const agents: Agent[] = [
  { name: "CEO AI", department: "Executive", purpose: "Portfolio health, profitability, and strategic risk across the company.", inputs: "All project KPIs, finance, pipeline, benchmarks", outputs: "Executive briefings, health score, strategic alerts", autonomy: "Recommends only", approvalGate: "All outputs advisory", actions30d: 41, acceptRate: 0.74, status: "Active" },
  { name: "COO AI", department: "Executive", purpose: "Cross-project coordination, resource balancing, and delay mitigation.", inputs: "Programmes, resource plans, site progress", outputs: "Re-sequencing proposals, resource moves", autonomy: "Requires approval", approvalGate: "Any schedule re-baseline", actions30d: 63, acceptRate: 0.68, status: "Active" },
  { name: "CFO AI", department: "Finance", purpose: "Cashflow simulation, margin forecasting, and invoice validation.", inputs: "Valuations, commitments, invoices, market indices", outputs: "Cash forecasts, margin alerts, validated invoices", autonomy: "Autonomous within limits", approvalGate: "Payments and facility draws", actions30d: 188, acceptRate: 0.91, status: "Active" },
  { name: "Engineering AI", department: "Engineering", purpose: "Drawing review, load checks, and code compliance across disciplines.", inputs: "Drawings, BIM models, codes (SANS, Eurocode)", outputs: "Review findings, compliance reports", autonomy: "Autonomous within limits", approvalGate: "Engineer sign-off before issue", actions30d: 342, acceptRate: 0.88, status: "Active" },
  { name: "Estimator AI", department: "Engineering", purpose: "Quantity takeoff and cost estimation from models and drawings.", inputs: "BIM, drawings, rate libraries, market prices", outputs: "BOQs, estimates, tender pricing", autonomy: "Requires approval", approvalGate: "All submitted prices", actions30d: 57, acceptRate: 0.79, status: "Active" },
  { name: "Scheduler AI", department: "Construction", purpose: "Programme generation, critical path optimization, delay prediction.", inputs: "Programmes, progress, weather, supplier lead times", outputs: "Schedules, float analysis, delay alerts", autonomy: "Autonomous within limits", approvalGate: "Baseline changes", actions30d: 214, acceptRate: 0.82, status: "Active" },
  { name: "Construction AI", department: "Construction", purpose: "Site progress from photos and drones, daily plans, sequencing.", inputs: "Site captures, diaries, programmes", outputs: "Progress %, daily site plans, deviation flags", autonomy: "Autonomous within limits", approvalGate: "None — observational", actions30d: 428, acceptRate: 0.9, status: "Active" },
  { name: "Manufacturing AI", department: "Manufacturing", purpose: "Fabrication packages, BOMs, production scheduling, factory selection.", inputs: "IFC models, factory capacity, material prices", outputs: "Fab drawings, BOMs, work orders", autonomy: "Requires approval", approvalGate: "Work order release", actions30d: 96, acceptRate: 0.77, status: "Active" },
  { name: "Procurement AI", department: "Procurement", purpose: "Supplier discovery, RFQ generation, quote benchmarking, negotiation prep.", inputs: "BOQs, supplier network, price history", outputs: "RFQs, comparisons, award recommendations", autonomy: "Autonomous within limits", approvalGate: "POs above R500k", actions30d: 261, acceptRate: 0.86, status: "Active" },
  { name: "Quality AI", department: "Delivery", purpose: "Defect detection from captures, inspection scheduling, snag tracking.", inputs: "Photos, scans, checklists, specs", outputs: "Defect register entries, inspection plans", autonomy: "Autonomous within limits", approvalGate: "Closing defects requires QA sign-off", actions30d: 173, acceptRate: 0.84, status: "Active" },
  { name: "Safety AI", department: "Delivery", purpose: "Hazard detection, permit tracking, incident pattern analysis.", inputs: "Camera feeds, permits, incident log", outputs: "Observations, permit alerts, risk patterns", autonomy: "Autonomous within limits", approvalGate: "None — always alerts humans", actions30d: 152, acceptRate: 0.93, status: "Active" },
  { name: "Risk AI", department: "Executive", purpose: "Cross-domain risk scoring and early-warning aggregation per project.", inputs: "All module signals, external data (weather, FX, prices)", outputs: "Risk scores, early warnings, mitigation options", autonomy: "Recommends only", approvalGate: "All outputs advisory", actions30d: 89, acceptRate: 0.71, status: "Active" },
  { name: "Compliance AI", department: "Governance", purpose: "Regulatory checks: building codes, permits, environmental conditions.", inputs: "Drawings, permit registers, regulations", outputs: "Compliance reports, expiry alerts", autonomy: "Autonomous within limits", approvalGate: "Filings require sign-off", actions30d: 118, acceptRate: 0.9, status: "Active" },
  { name: "Legal AI", department: "Governance", purpose: "Contract analysis, obligation tracking, variation drafting support.", inputs: "Contracts, correspondence, VOs", outputs: "Obligation registers, clause flags, VO drafts", autonomy: "Recommends only", approvalGate: "All legal output reviewed by counsel", actions30d: 44, acceptRate: 0.66, status: "Active" },
  { name: "Project Manager AI", department: "Delivery", purpose: "Meeting summaries, action tracking, RFI routing, status reporting.", inputs: "Meetings, RFIs, tasks, programme", outputs: "Minutes, action lists, weekly reports", autonomy: "Autonomous within limits", approvalGate: "External comms require approval", actions30d: 309, acceptRate: 0.89, status: "Active" },
  { name: "Client Success AI", department: "Commercial", purpose: "Client reporting, portal updates, satisfaction signal tracking.", inputs: "Project data, client interactions", outputs: "Progress reports, approval requests, alerts", autonomy: "Autonomous within limits", approvalGate: "Report release configurable per client", actions30d: 84, acceptRate: 0.95, status: "Active" },
];

// ─── Infrastructure intelligence ────────────────────────────────────────────

export interface SectorIntel {
  sector: string;
  activeValue: number; // ZAR under management
  assets: number; // operating assets with live twins
  conditionScore: number; // 0-100 asset condition
  maintenanceDue: number;
  trend: "Growing" | "Stable" | "Contracting";
}

export const sectors: SectorIntel[] = [
  { sector: "Commercial buildings", activeValue: 486_000_000, assets: 12, conditionScore: 87, maintenanceDue: 3, trend: "Stable" },
  { sector: "Roads & civil", activeValue: 912_000_000, assets: 6, conditionScore: 78, maintenanceDue: 5, trend: "Growing" },
  { sector: "Renewable energy", activeValue: 1_640_000_000, assets: 4, conditionScore: 94, maintenanceDue: 1, trend: "Growing" },
  { sector: "Healthcare", activeValue: 356_000_000, assets: 3, conditionScore: 91, maintenanceDue: 2, trend: "Stable" },
  { sector: "Industrial & logistics", activeValue: 238_000_000, assets: 8, conditionScore: 82, maintenanceDue: 4, trend: "Growing" },
  { sector: "Data centres", activeValue: 2_100_000_000, assets: 0, conditionScore: 0, maintenanceDue: 0, trend: "Growing" },
];

export interface AssetRecord {
  name: string;
  sector: string;
  commissioned: string;
  condition: number;
  nextMaintenance: string;
  openWorkOrders: number;
  energyTrend: string;
}

export const assets: AssetRecord[] = [
  { name: "Rosebank Link Offices", sector: "Commercial buildings", commissioned: "2023-04", condition: 89, nextMaintenance: "2026-08-12 — HVAC coil replacement", openWorkOrders: 2, energyTrend: "-4% YoY" },
  { name: "N3 Van Reenen realignment", sector: "Roads & civil", commissioned: "2021-11", condition: 76, nextMaintenance: "2026-09-01 — surface rehabilitation, km 12–18", openWorkOrders: 3, energyTrend: "n/a" },
  { name: "De Aar 90MW Solar", sector: "Renewable energy", commissioned: "2024-06", condition: 95, nextMaintenance: "2026-07-29 — inverter firmware + string test", openWorkOrders: 1, energyTrend: "+2% vs P50" },
  { name: "Khayelitsha District Clinic", sector: "Healthcare", commissioned: "2022-09", condition: 90, nextMaintenance: "2026-10-05 — generator service", openWorkOrders: 1, energyTrend: "-1% YoY" },
  { name: "Epping Cold Store", sector: "Industrial & logistics", commissioned: "2020-02", condition: 79, nextMaintenance: "2026-08-03 — ammonia plant inspection", openWorkOrders: 4, energyTrend: "+6% YoY ⚠" },
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
