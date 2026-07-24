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

// ════════════════════════════════════════════════════════════════════════════
//  EXPERT-GRADE ENGINES — limit-state design, CPM, EVM, tender adjudication.
//  Formulae follow SANS 10160/10162 (steel) and SANS 10100/EN 1992 (concrete)
//  conventions. Simplified where a full section-property database would be
//  needed; every result is derived, none hardcoded.
// ════════════════════════════════════════════════════════════════════════════

// ─── Limit-state actions (load combinations) ────────────────────────────────

export interface Actions {
  wUls: number; // kN/m, ultimate (1.2G + 1.6Q)
  wSls: number; // kN/m, serviceability (1.0G + 1.0Q)
  nUlsPerFloor: number; // kN, ultimate axial per floor per m² tributary basis
}

export function loadCombination(
  deadKpa: number,
  liveKpa: number,
  spacing: number, // m — tributary width for a beam
): Actions {
  const wUls = (1.2 * deadKpa + 1.6 * liveKpa) * spacing;
  const wSls = (1.0 * deadKpa + 1.0 * liveKpa) * spacing;
  const nUlsPerFloor = 1.2 * deadKpa + 1.6 * liveKpa; // kN/m² factored
  return { wUls, wSls, nUlsPerFloor };
}

// ─── Steel beam — three limit-state checks (bending, shear, deflection) ──────

const GAMMA_M0 = 1.0;
const GAMMA_M1 = 1.0;

export interface LimitCheck {
  name: string;
  demand: string;
  capacity: string;
  utilisation: number; // 0..>1
  pass: boolean;
  code: string;
}

export interface BeamDesign {
  wUls: number;
  wSls: number;
  moment: number; // kNm
  shear: number; // kN
  section: Section | null;
  checks: LimitCheck[];
  governing: string;
  overallUtil: number;
  tonnage: number;
  pass: boolean;
}

// Approximate cross-sectional & shear area from mass (A = m/(ρ)); Av ≈ 0.5A.
function steelAreas(mass: number) {
  const A_cm2 = mass * 1.2739; // kg/m ÷ 7.85 g/cm³ ×10
  const Av_cm2 = 0.5 * A_cm2; // indicative web shear area
  return { A_cm2, Av_cm2 };
}

export function designSteelBeam(
  a: Actions,
  span: number,
  count: number,
  deflRatio = 360,
): BeamDesign {
  const L = span;
  const moment = (a.wUls * L * L) / 8; // kNm
  const shear = (a.wUls * L) / 2; // kN
  const Lmm = L * 1000;
  const deflLimit = Lmm / deflRatio;

  const capacity = (s: Section) => {
    const Mrd = (s.wpl * 1000 * FY) / 1e6 / GAMMA_M0; // kNm
    const { Av_cm2 } = steelAreas(s.mass);
    const Vrd = (Av_cm2 * 100 * (FY / Math.sqrt(3))) / 1e3 / GAMMA_M0; // kN
    const defl = (5 * a.wSls * Lmm ** 4) / (384 * E * s.ixx * 1e4); // mm, SLS
    return { Mrd, Vrd, defl };
  };

  let section: Section | null = null;
  for (const s of [...ubSections].sort((x, y) => x.mass - y.mass)) {
    const c = capacity(s);
    if (moment <= c.Mrd && shear <= c.Vrd && c.defl <= deflLimit) {
      section = s;
      break;
    }
  }
  const s = section ?? ubSections[ubSections.length - 1];
  const c = capacity(s);

  const checks: LimitCheck[] = [
    {
      name: "Bending (ULS)",
      demand: `M_Ed ${moment.toFixed(0)} kNm`,
      capacity: `M_Rd ${c.Mrd.toFixed(0)} kNm`,
      utilisation: moment / c.Mrd,
      pass: moment <= c.Mrd,
      code: "SANS 10162-1 cl.13.5",
    },
    {
      name: "Shear (ULS)",
      demand: `V_Ed ${shear.toFixed(0)} kN`,
      capacity: `V_Rd ${c.Vrd.toFixed(0)} kN`,
      utilisation: shear / c.Vrd,
      pass: shear <= c.Vrd,
      code: "SANS 10162-1 cl.13.4",
    },
    {
      name: "Deflection (SLS)",
      demand: `δ ${c.defl.toFixed(1)} mm`,
      capacity: `δ_lim L/${deflRatio} = ${deflLimit.toFixed(1)} mm`,
      utilisation: c.defl / deflLimit,
      pass: c.defl <= deflLimit,
      code: "SANS 10160-1 Table 3",
    },
  ];
  const overallUtil = Math.max(...checks.map((k) => k.utilisation));
  const governing = checks.reduce((a2, b) => (b.utilisation > a2.utilisation ? b : a2)).name;
  const tonnage = (s.mass * L * count) / 1000;

  return {
    wUls: a.wUls,
    wSls: a.wSls,
    moment,
    shear,
    section,
    checks,
    governing,
    overallUtil,
    tonnage,
    pass: section !== null,
  };
}

// ─── Steel column — flexural buckling (EN 1993 curve b) ──────────────────────

export interface Ucsection {
  name: string;
  mass: number; // kg/m
  area: number; // cm²
  iMin: number; // radius of gyration, cm (minor axis)
}

export const ucSections: Ucsection[] = [
  { name: "152×152×23 UC", mass: 23.4, area: 29.8, iMin: 3.7 },
  { name: "203×203×46 UC", mass: 46.1, area: 58.7, iMin: 5.13 },
  { name: "203×203×60 UC", mass: 60.0, area: 76.4, iMin: 5.2 },
  { name: "254×254×73 UC", mass: 73.1, area: 93.1, iMin: 6.48 },
  { name: "254×254×89 UC", mass: 88.9, area: 113, iMin: 6.55 },
  { name: "305×305×97 UC", mass: 96.9, area: 123, iMin: 7.69 },
  { name: "305×305×137 UC", mass: 137, area: 174, iMin: 7.83 },
  { name: "356×368×153 UC", mass: 153, area: 195, iMin: 9.49 },
];

export interface ColumnDesign {
  nEd: number; // kN
  effLength: number; // m
  section: Ucsection | null;
  slenderness: number; // λ̄ non-dimensional
  chi: number; // buckling reduction
  nbRd: number; // kN
  utilisation: number;
  pass: boolean;
}

export function designSteelColumn(
  nEd: number, // kN, factored axial
  height: number, // m
  effLengthFactor = 1.0,
): ColumnDesign {
  const Le = height * effLengthFactor;
  const lambda1 = Math.PI * Math.sqrt(E / FY); // 93.9ε
  const pick = (u: Ucsection) => {
    const A_mm2 = u.area * 100;
    const i_mm = u.iMin * 10;
    const lambda = (Le * 1000) / i_mm;
    const lambdaBar = lambda / lambda1;
    const alpha = 0.34; // curve b
    const phi = 0.5 * (1 + alpha * (lambdaBar - 0.2) + lambdaBar * lambdaBar);
    const chi = Math.min(1, 1 / (phi + Math.sqrt(Math.max(phi * phi - lambdaBar * lambdaBar, 0))));
    const nbRd = (chi * A_mm2 * FY) / 1e3 / GAMMA_M1; // kN
    return { lambdaBar, chi, nbRd };
  };
  let section: Ucsection | null = null;
  let r = { lambdaBar: 0, chi: 0, nbRd: 0 };
  for (const u of [...ucSections].sort((x, y) => x.mass - y.mass)) {
    r = pick(u);
    if (nEd <= r.nbRd) {
      section = u;
      break;
    }
  }
  const u = section ?? ucSections[ucSections.length - 1];
  if (!section) r = pick(u);
  return {
    nEd,
    effLength: Le,
    section,
    slenderness: r.lambdaBar,
    chi: r.chi,
    nbRd: r.nbRd,
    utilisation: nEd / r.nbRd,
    pass: section !== null,
  };
}

// ─── Reinforced-concrete beam (EN 1992-1-1 / SANS 10100) ─────────────────────

const BAR_SIZES = [12, 16, 20, 25, 32]; // mm
const barArea = (d: number) => (Math.PI / 4) * d * d; // mm²
const barMassPerM = (d: number) => 0.006165 * d * d; // kg/m (ρ=7850)

export interface RcBeamDesign {
  b: number;
  h: number;
  d: number; // effective depth mm
  moment: number; // kNm
  shear: number; // kN
  k: number;
  leverArm: number; // z, mm
  asReq: number; // mm²
  bars: { count: number; dia: number; asProv: number };
  linkDia: number;
  linkSpacing: number; // mm
  concreteVol: number; // m³
  rebarMass: number; // kg
  singlyReinforced: boolean;
  utilisation: number;
}

export function designRcBeam(
  a: Actions,
  span: number,
  count: number,
  b = 300,
  h = 600,
  fck = 30,
  fyk = 450,
  cover = 40,
): RcBeamDesign {
  const L = span;
  const moment = (a.wUls * L * L) / 8; // kNm
  const shear = (a.wUls * L) / 2; // kN
  const assumedBar = 25;
  const d = h - cover - 10 - assumedBar / 2; // link 10mm assumed
  const Med = moment * 1e6; // Nmm
  const k = Med / (b * d * d * fck);
  const singly = k <= 0.167;
  const z = Math.min(0.95 * d, d * (0.5 + Math.sqrt(Math.max(0.25 - k / 1.134, 0))));
  const asReq = Med / (0.87 * fyk * z); // mm²

  // choose bar arrangement: smallest (dia,count) with As_prov ≥ As_req, count 2..8
  let best = { count: 8, dia: 32, asProv: 8 * barArea(32) };
  for (const dia of BAR_SIZES) {
    for (let n = 2; n <= 8; n++) {
      const asProv = n * barArea(dia);
      if (asProv >= asReq) {
        if (asProv < best.asProv) best = { count: n, dia, asProv };
        break;
      }
    }
  }

  // shear links (vertical stirrups, simplified variable-strut θ=22°→cotθ=2.5)
  const cotTheta = 2.5;
  const linkDia = 10;
  const Asw = 2 * barArea(linkDia); // 2-leg
  const sReq = (Asw * 0.87 * fyk * (d * 0.9) * cotTheta) / (shear * 1e3); // mm
  const linkSpacing = Math.max(75, Math.round(Math.min(0.75 * d, sReq) / 25) * 25);

  const concreteVol = (b / 1000) * (h / 1000) * L * count;
  const mainMass = best.count * barMassPerM(best.dia) * L;
  const linkPerimeter = (2 * (b - 2 * cover) + 2 * (h - 2 * cover)) / 1000; // m
  const linkCount = Math.ceil((L * 1000) / linkSpacing);
  const linkMass = linkCount * linkPerimeter * barMassPerM(linkDia);
  const rebarMass = (mainMass + linkMass) * count;

  return {
    b,
    h,
    d,
    moment,
    shear,
    k,
    leverArm: z,
    asReq,
    bars: best,
    linkDia,
    linkSpacing,
    concreteVol,
    rebarMass,
    singlyReinforced: singly,
    utilisation: asReq / best.asProv,
  };
}

// ─── Bar bending schedule (BS 8666 style) ────────────────────────────────────

export interface BarLine {
  mark: string;
  type: string;
  dia: number;
  shape: string;
  count: number;
  lengthEach: number; // mm
  totalLength: number; // m
  mass: number; // kg
}

export function barSchedule(rc: RcBeamDesign, span: number): BarLine[] {
  const L = span * 1000;
  const anchorage = 40; // ×dia laps/hooks factor per side
  // Bottom main bars — shape 00 (straight) with end anchorage
  const mainLen = Math.round(L + 2 * anchorage * rc.bars.dia);
  const main: BarLine = {
    mark: "01",
    type: "Bottom main",
    dia: rc.bars.dia,
    shape: "00 (straight)",
    count: rc.bars.count,
    lengthEach: mainLen,
    totalLength: (mainLen * rc.bars.count) / 1000,
    mass: barMassPerM(rc.bars.dia) * (mainLen / 1000) * rc.bars.count,
  };
  // Top hanger bars — 2×dia16 nominal
  const topLen = Math.round(L + 2 * anchorage * 16);
  const top: BarLine = {
    mark: "02",
    type: "Top hangers",
    dia: 16,
    shape: "00 (straight)",
    count: 2,
    lengthEach: topLen,
    totalLength: (topLen * 2) / 1000,
    mass: barMassPerM(16) * (topLen / 1000) * 2,
  };
  // Links — shape 51 (closed rectangle)
  const linkCount = Math.ceil(L / rc.linkSpacing);
  const linkLen = Math.round(2 * (rc.b - 80) + 2 * (rc.h - 80) + 2 * 75); // + hooks
  const links: BarLine = {
    mark: "03",
    type: `Links @ ${rc.linkSpacing}mm`,
    dia: rc.linkDia,
    shape: "51 (closed link)",
    count: linkCount,
    lengthEach: linkLen,
    totalLength: (linkLen * linkCount) / 1000,
    mass: barMassPerM(rc.linkDia) * (linkLen / 1000) * linkCount,
  };
  return [main, top, links];
}

// ─── Critical Path Method (CPM) ──────────────────────────────────────────────

export interface Activity {
  id: string;
  name: string;
  duration: number; // days
  preds: string[];
}

export interface CpmActivity extends Activity {
  es: number;
  ef: number;
  ls: number;
  lf: number;
  totalFloat: number;
  critical: boolean;
}

export interface CpmResult {
  activities: CpmActivity[];
  projectDuration: number;
  criticalPath: string[];
}

export function cpm(net: Activity[]): CpmResult {
  const byId = new Map(net.map((a) => [a.id, a]));
  const es = new Map<string, number>();
  const ef = new Map<string, number>();
  // forward pass (topological by resolving preds)
  const resolve = (id: string): number => {
    if (ef.has(id)) return ef.get(id)!;
    const a = byId.get(id)!;
    const start = a.preds.length ? Math.max(...a.preds.map((p) => resolve(p))) : 0;
    es.set(id, start);
    ef.set(id, start + a.duration);
    return ef.get(id)!;
  };
  net.forEach((a) => resolve(a.id));
  const projectDuration = Math.max(...net.map((a) => ef.get(a.id)!));

  // successors
  const succs = new Map<string, string[]>();
  net.forEach((a) => a.preds.forEach((p) => succs.set(p, [...(succs.get(p) ?? []), a.id])));

  const lf = new Map<string, number>();
  const ls = new Map<string, number>();
  const back = (id: string): number => {
    if (ls.has(id)) return ls.get(id)!;
    const a = byId.get(id)!;
    const s = succs.get(id) ?? [];
    const finish = s.length ? Math.min(...s.map((x) => back(x))) : projectDuration;
    lf.set(id, finish);
    ls.set(id, finish - a.duration);
    return ls.get(id)!;
  };
  net.forEach((a) => back(a.id));

  const activities: CpmActivity[] = net.map((a) => {
    const tf = ls.get(a.id)! - es.get(a.id)!;
    return {
      ...a,
      es: es.get(a.id)!,
      ef: ef.get(a.id)!,
      ls: ls.get(a.id)!,
      lf: lf.get(a.id)!,
      totalFloat: tf,
      critical: tf === 0,
    };
  });
  const criticalPath = activities.filter((a) => a.critical).map((a) => a.id);
  return { activities, projectDuration, criticalPath };
}

// ─── Earned Value Management (EVM) ───────────────────────────────────────────

export interface EvmResult {
  pv: number; // planned value
  ev: number; // earned value
  ac: number; // actual cost
  cv: number; // cost variance
  sv: number; // schedule variance
  cpi: number;
  spi: number;
  eac: number; // estimate at completion
  etc: number; // estimate to complete
  vac: number; // variance at completion
  tcpi: number; // to-complete performance index
}

export function evm(p: {
  bac: number; // budget at completion
  plannedPct: number; // 0..1
  actualPct: number; // 0..1 (physical % complete)
  actualCost: number;
}): EvmResult {
  const pv = p.bac * p.plannedPct;
  const ev = p.bac * p.actualPct;
  const ac = p.actualCost;
  const cpi = ac > 0 ? ev / ac : 1;
  const spi = pv > 0 ? ev / pv : 1;
  const eac = cpi > 0 ? p.bac / cpi : p.bac;
  return {
    pv,
    ev,
    ac,
    cv: ev - ac,
    sv: ev - pv,
    cpi,
    spi,
    eac,
    etc: eac - ac,
    vac: p.bac - eac,
    tcpi: p.bac - ac !== 0 ? (p.bac - ev) / (p.bac - ac) : 1,
  };
}

// ─── Weighted tender adjudication ────────────────────────────────────────────

export interface Bidder {
  name: string;
  price: number; // R (lower better)
  leadWeeks: number; // lower better
  quality: number; // /5 higher better
  compliance: number; // % higher better
  bbbee: number; // level 1..8 (lower better)
}

export interface BidWeights {
  price: number;
  lead: number;
  quality: number;
  compliance: number;
  bbbee: number;
}

export interface BidScore {
  name: string;
  price: number;
  scores: { price: number; lead: number; quality: number; compliance: number; bbbee: number };
  total: number;
  rank: number;
}

export function adjudicate(bidders: Bidder[], w: BidWeights): BidScore[] {
  const minPrice = Math.min(...bidders.map((b) => b.price));
  const minLead = Math.min(...bidders.map((b) => b.leadWeeks));
  const norm = bidders.map((b) => {
    const price = (minPrice / b.price) * 100; // lowest price = 100
    const lead = (minLead / b.leadWeeks) * 100;
    const quality = (b.quality / 5) * 100;
    const compliance = b.compliance;
    const bbbee = ((9 - b.bbbee) / 8) * 100; // level 1 → 100
    const total =
      (price * w.price + lead * w.lead + quality * w.quality + compliance * w.compliance + bbbee * w.bbbee) /
      (w.price + w.lead + w.quality + w.compliance + w.bbbee);
    return { name: b.name, price: b.price, scores: { price, lead, quality, compliance, bbbee }, total };
  });
  return norm
    .sort((a, b) => b.total - a.total)
    .map((b, i) => ({ ...b, rank: i + 1 }));
}

// ─── Economic Order Quantity (Wilson) ────────────────────────────────────────

export interface EoqResult {
  eoq: number; // units
  ordersPerYear: number;
  cycleDays: number;
  reorderPoint: number; // units
  safetyStock: number;
  annualOrderingCost: number;
  annualHoldingCost: number;
  totalAnnualCost: number;
}

export function eoq(p: {
  annualDemand: number; // units/yr
  orderingCost: number; // R/order
  holdingCost: number; // R/unit/yr
  leadDays: number;
  serviceZ: number; // safety factor (e.g. 1.65 = 95%)
  demandStd: number; // daily demand std (units)
}): EoqResult {
  const Q = Math.sqrt((2 * p.annualDemand * p.orderingCost) / p.holdingCost);
  const daily = p.annualDemand / 365;
  const safetyStock = p.serviceZ * p.demandStd * Math.sqrt(p.leadDays);
  const reorderPoint = daily * p.leadDays + safetyStock;
  const ordersPerYear = p.annualDemand / Q;
  return {
    eoq: Q,
    ordersPerYear,
    cycleDays: 365 / ordersPerYear,
    reorderPoint,
    safetyStock,
    annualOrderingCost: ordersPerYear * p.orderingCost,
    annualHoldingCost: (Q / 2) * p.holdingCost,
    totalAnnualCost: ordersPerYear * p.orderingCost + (Q / 2) * p.holdingCost,
  };
}
