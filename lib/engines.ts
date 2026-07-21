// Real computation engines. These are pure, deterministic functions with
// genuine engineering and financial math — no hardcoded results. Every output
// is derived from the inputs. This is what makes the "AI" screens compute for
// real; an LLM layer would sit on top of these, not replace them.

// ─── Structural: simply-supported beam design (Eurocode-style, S355) ────────

export interface Section {
  name: string;
  mass: number; // kg/m
  wpl: number; // plastic modulus, cm³
  ixx: number; // second moment of area, cm⁴
}

// Representative universal-beam catalogue (values close to real UB tables).
export const ubSections: Section[] = [
  { name: "203×133×25 UB", mass: 25.1, wpl: 258, ixx: 2340 },
  { name: "254×146×31 UB", mass: 31.1, wpl: 393, ixx: 4413 },
  { name: "305×165×40 UB", mass: 40.3, wpl: 623, ixx: 8503 },
  { name: "356×171×45 UB", mass: 45.0, wpl: 774, ixx: 12070 },
  { name: "406×178×54 UB", mass: 54.1, wpl: 1055, ixx: 18720 },
  { name: "457×191×67 UB", mass: 67.1, wpl: 1471, ixx: 29380 },
  { name: "533×210×82 UB", mass: 82.2, wpl: 2059, ixx: 47540 },
  { name: "610×229×101 UB", mass: 101, wpl: 2881, ixx: 75780 },
  { name: "686×254×125 UB", mass: 125, wpl: 3994, ixx: 118000 },
  { name: "762×267×147 UB", mass: 147, wpl: 5156, ixx: 169000 },
];

const FY = 355; // N/mm², S355 steel
const E = 210_000; // N/mm², Young's modulus

export interface BeamResult {
  moment: number; // kNm
  shear: number; // kN
  zReq: number; // cm³ required plastic modulus
  section: Section | null;
  utilisation: number; // 0-1 by bending
  deflection: number; // mm
  deflLimit: number; // mm
  deflGoverns: boolean;
  massPerBeam: number; // kg
  tonnage: number; // tonnes total
  governedBy: "Bending" | "Deflection" | "—";
}

export function designBeam(
  load: number, // kN/m (UDL)
  span: number, // m
  count: number,
  deflRatio = 360,
): BeamResult {
  const moment = (load * span * span) / 8; // kNm
  const shear = (load * span) / 2; // kN
  const zReq = (moment * 1e6) / FY / 1e3; // cm³

  const deflLimit = (span * 1000) / deflRatio; // mm
  const w = load; // kN/m == N/mm
  const Lmm = span * 1000;

  const deflOf = (I_cm4: number) => (5 * w * Lmm ** 4) / (384 * E * I_cm4 * 1e4);

  // Smallest section (by mass) that passes both bending and deflection.
  let chosen: Section | null = null;
  let bendingOnly: Section | null = null;
  for (const s of [...ubSections].sort((a, b) => a.mass - b.mass)) {
    if (s.wpl >= zReq && !bendingOnly) bendingOnly = s;
    if (s.wpl >= zReq && deflOf(s.ixx) <= deflLimit) {
      chosen = s;
      break;
    }
  }

  const section = chosen;
  const deflection = section ? deflOf(section.ixx) : Infinity;
  const utilisation = section ? zReq / section.wpl : 0;
  const massPerBeam = section ? section.mass * span : 0;
  const tonnage = (massPerBeam * count) / 1000;
  const deflGoverns = !!(section && bendingOnly && section.mass > bendingOnly.mass);

  return {
    moment,
    shear,
    zReq,
    section,
    utilisation,
    deflection: section ? deflection : 0,
    deflLimit,
    deflGoverns,
    massPerBeam,
    tonnage,
    governedBy: section ? (deflGoverns ? "Deflection" : "Bending") : "—",
  };
}

// ─── Parametric layout: floor plan + structural grid ────────────────────────

export interface GridResult {
  columns: number;
  gfa: number; // m² gross floor area
  baySpanX: number;
  baySpanY: number;
  tributary: number; // m² per internal column
  axialLoad: number; // kN per internal column (est.)
}

export function structuralGrid(
  width: number, // m
  length: number, // m
  baysX: number,
  baysY: number,
  floorLoad = 7.5, // kPa (dead+live, typical office)
  floors = 1,
): GridResult {
  const gridsX = baysX + 1;
  const gridsY = baysY + 1;
  const columns = gridsX * gridsY;
  const baySpanX = width / baysX;
  const baySpanY = length / baysY;
  const tributary = baySpanX * baySpanY;
  const gfa = width * length;
  const axialLoad = tributary * floorLoad * floors; // kN
  return { columns, gfa, baySpanX, baySpanY, tributary, axialLoad };
}

export interface Room {
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
}

// Deterministic room packing into a rectangle (recursive split by ratio).
export function floorPlan(
  width: number,
  length: number,
  rooms: number,
): { rooms: Room[]; gfa: number; efficiency: number } {
  const names = [
    "Ward A", "Ward B", "Theatre", "Core", "Plant", "Store",
    "Office", "Reception", "Lab", "Clean util", "Recovery", "Corridor",
  ];
  const out: Room[] = [];
  // Slice the plan into a near-square grid of `rooms` cells.
  const cols = Math.ceil(Math.sqrt(rooms * (width / length)));
  const rowsN = Math.ceil(rooms / cols);
  const cw = width / cols;
  const ch = length / rowsN;
  let i = 0;
  for (let r = 0; r < rowsN && i < rooms; r++) {
    for (let c = 0; c < cols && i < rooms; c++) {
      out.push({
        name: names[i % names.length],
        x: c * cw,
        y: r * ch,
        w: cw,
        h: ch,
        area: cw * ch,
      });
      i++;
    }
  }
  const gfa = width * length;
  const net = out.reduce((s, rm) => s + rm.area, 0);
  return { rooms: out, gfa, efficiency: net / gfa };
}

// ─── Manufacturing production simulation ────────────────────────────────────

export interface ProductionResult {
  totalHours: number;
  dailyHours: number;
  durationDays: number;
  throughputPerDay: number;
  labourCost: number;
  logistics: number;
  totalCost: number;
  deliveryDate: string;
  utilisation: number; // 0-1 vs machine capacity
}

export function simulateProduction(p: {
  units: number;
  cycleHrs: number; // machine-hours per unit
  machines: number;
  shifts: 1 | 2;
  shiftPremiumPct: number;
  labourRate: number; // R per machine-hour
  logisticsPerUnit: number;
  start?: Date;
}): ProductionResult {
  const hoursPerShift = 8;
  const dailyHours = p.machines * p.shifts * hoursPerShift;
  const totalHours = p.units * p.cycleHrs;
  const durationDays = Math.ceil(totalHours / dailyHours);
  const throughputPerDay = dailyHours / p.cycleHrs;
  const secondShiftFraction = p.shifts === 2 ? 0.5 : 0;
  const labourCost =
    totalHours * p.labourRate * (1 + secondShiftFraction * (p.shiftPremiumPct / 100));
  const logistics = p.units * p.logisticsPerUnit;
  const totalCost = labourCost + logistics;
  const start = p.start ?? new Date("2026-07-21");
  const delivery = new Date(start);
  // add working days (5-day week)
  let added = 0;
  while (added < durationDays) {
    delivery.setDate(delivery.getDate() + 1);
    const d = delivery.getDay();
    if (d !== 0 && d !== 6) added++;
  }
  const utilisation = Math.min(1, totalHours / (dailyHours * durationDays));
  return {
    totalHours,
    dailyHours,
    durationDays,
    throughputPerDay,
    labourCost,
    logistics,
    totalCost,
    deliveryDate: delivery.toISOString().slice(0, 10),
    utilisation,
  };
}

// ─── Procurement savings ────────────────────────────────────────────────────

export interface ProcResult {
  priceSaving: number;
  consolidationSaving: number;
  inventorySaving: number;
  totalSaving: number;
  savingPct: number;
  carryingCost: number; // cost of delaying (working capital)
  netSaving: number;
}

export function procurementSavings(p: {
  orderValue: number;
  priceDeltaPct: number; // negative = price drop over the delay window
  delayDays: number;
  orders: number; // POs to consolidate
  logisticsPerOrder: number;
  inventoryOffsetPct: number; // % of order already in stock
  costOfCapitalPct: number; // annual
}): ProcResult {
  const priceSaving = p.priceDeltaPct < 0 ? p.orderValue * (-p.priceDeltaPct / 100) : 0;
  const consolidationSaving = Math.max(0, p.orders - 1) * p.logisticsPerOrder * 0.4;
  const inventorySaving = p.orderValue * (p.inventoryOffsetPct / 100);
  const totalSaving = priceSaving + consolidationSaving + inventorySaving;
  const carryingCost =
    p.orderValue * (p.costOfCapitalPct / 100) * (p.delayDays / 365);
  const netSaving = totalSaving - carryingCost;
  return {
    priceSaving,
    consolidationSaving,
    inventorySaving,
    totalSaving,
    savingPct: totalSaving / p.orderValue,
    carryingCost,
    netSaving,
  };
}

// ─── Finance: 13-week cash projection ───────────────────────────────────────

export interface CashResult {
  weeks: { week: number; balance: number }[];
  minBalance: number;
  minWeek: number;
  shortfallWeek: number | null;
  endBalance: number;
}

export function projectCash(p: {
  startCash: number;
  weeklyInflow: number;
  weeklyOutflow: number;
  accelerateReceivables: number; // one-off inflow, week 2
  delayCapex: number; // removes this outflow across the window
  drawFacility: number; // one-off inflow, week 1
  floor: number;
}): CashResult {
  const weeks: { week: number; balance: number }[] = [];
  let balance = p.startCash;
  let minBalance = balance;
  let minWeek = 0;
  let shortfallWeek: number | null = null;
  const capexPerWeek = p.delayCapex / 13;
  for (let w = 1; w <= 13; w++) {
    let net = p.weeklyInflow - p.weeklyOutflow + capexPerWeek;
    if (w === 1) net += p.drawFacility;
    if (w === 2) net += p.accelerateReceivables;
    balance += net;
    weeks.push({ week: w, balance });
    if (balance < minBalance) {
      minBalance = balance;
      minWeek = w;
    }
    if (balance < p.floor && shortfallWeek === null) shortfallWeek = w;
  }
  return {
    weeks,
    minBalance,
    minWeek,
    shortfallWeek,
    endBalance: balance,
  };
}

// ─── Collaboration cascade ──────────────────────────────────────────────────

export interface CascadeResult {
  steelDelta: number; // tonnes
  procurementCost: number; // R
  budgetImpactPct: number;
  marginImpactPts: number;
  fabDays: number;
  scheduleImpactDays: number;
  cashImpact: number;
  nodes: { agent: string; dept: string; effect: string }[];
}

export function cascade(p: {
  steelDelta: number; // tonnes change
  steelRate: number; // R per tonne (supply+fab)
  fabThroughput: number; // tonnes/day
  projectBudget: number;
  tenderMargin: number; // %
}): CascadeResult {
  const procurementCost = p.steelDelta * p.steelRate;
  const budgetImpactPct = (procurementCost / p.projectBudget) * 100;
  const marginImpactPts = -budgetImpactPct; // cost eats directly into margin
  const fabDays = p.steelDelta / p.fabThroughput;
  const scheduleImpactDays = Math.max(0, fabDays);
  const cashImpact = -procurementCost;
  const sign = p.steelDelta >= 0 ? "+" : "−";
  const abs = Math.abs(p.steelDelta);
  const money = (n: number) =>
    `R${(Math.abs(n) / 1e6).toFixed(2)}m`;
  const nodes = [
    {
      agent: "Structural Engineering AI",
      dept: "Engineering",
      effect: `Revision changes steel quantity by ${sign}${abs.toFixed(0)} t`,
    },
    {
      agent: "Procurement AI",
      dept: "Procurement",
      effect: `Purchase requirement ${p.steelDelta >= 0 ? "rises" : "falls"} by ${money(procurementCost)}`,
    },
    {
      agent: "Manufacturing AI",
      dept: "Manufacturing",
      effect: `Fabrication load ${p.steelDelta >= 0 ? "adds" : "frees"} ${Math.abs(fabDays).toFixed(1)} days`,
    },
    {
      agent: "Scheduler AI",
      dept: "Construction",
      effect: `Steel erection window shifts ${scheduleImpactDays > 0 ? `+${scheduleImpactDays.toFixed(1)}` : "0"} days`,
    },
    {
      agent: "CFO AI",
      dept: "Finance",
      effect: `Forecast margin moves ${marginImpactPts >= 0 ? "+" : ""}${marginImpactPts.toFixed(2)} pts to ${(p.tenderMargin + marginImpactPts).toFixed(1)}%`,
    },
    {
      agent: "CEO AI",
      dept: "Executive",
      effect: `Commercial impact ${money(cashImpact)} ${cashImpact < 0 ? "cost" : "saving"} — flagged for approval`,
    },
  ];
  return {
    steelDelta: p.steelDelta,
    procurementCost,
    budgetImpactPct,
    marginImpactPts,
    fabDays,
    scheduleImpactDays,
    cashImpact,
    nodes,
  };
}

export function rands(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "−" : "";
  if (abs >= 1e9) return `${sign}R${(abs / 1e9).toFixed(2)}bn`;
  if (abs >= 1e6) return `${sign}R${(abs / 1e6).toFixed(2)}m`;
  if (abs >= 1e3) return `${sign}R${(abs / 1e3).toFixed(0)}k`;
  return `${sign}R${abs.toFixed(0)}`;
}
