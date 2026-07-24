// ── Shared fabrication / parts model ───────────────────────────────────────
// Engineering details these parts, Manufacturing fabricates + measures them,
// Construction installs them on site. One dataset, three studios.

export type FabMethod =
  | "CNC Laser"
  | "CNC Plasma"
  | "CNC Milling"
  | "Press Brake"
  | "Boilermaker / Weld"
  | "Cast-in"
  | "Extrusion";

export type PartStatus =
  | "Detailing"
  | "Approved"
  | "For Fabrication"
  | "In Fabrication"
  | "QA / Inspection"
  | "Dispatched"
  | "Installed";

export const STATUS_ORDER: PartStatus[] = [
  "Detailing",
  "Approved",
  "For Fabrication",
  "In Fabrication",
  "QA / Inspection",
  "Dispatched",
  "Installed",
];

export interface Hole {
  x: number; // mm from part origin (bottom-left)
  y: number;
  d: number; // Ø mm
}

export interface Part {
  id: string;
  name: string;
  category: string;
  method: FabMethod;
  material: string;
  grade: string;
  w: number; // mm plate/part footprint
  h: number;
  thk: number; // mm
  holes: Hole[];
  qty: number;
  unitMass: number; // kg
  tolerance: string;
  finish: string;
  factory: string;
  status: PartStatus;
  progress: number; // 0-100
  due: string;
  site: string;
  rev: string;
  outstanding: string;
}

export const PARTS: Part[] = [
  {
    id: "SC-118", name: "Beam–column end plate", category: "Steel connection", method: "CNC Laser", material: "Plate", grade: "S355JR",
    w: 320, h: 220, thk: 20, holes: [ { x: 60, y: 45, d: 26 }, { x: 260, y: 45, d: 26 }, { x: 60, y: 175, d: 26 }, { x: 260, y: 175, d: 26 } ],
    qty: 48, unitMass: 11.1, tolerance: "±1.0 mm", finish: "Hot-dip galvanised", factory: "ArcelorMittal SA", status: "In Fabrication", progress: 62, due: "12 Aug", site: "Sandton Gate · L18–L24", rev: "C",
    outstanding: "34 of 48 laser-cut; drilling + galvanising pending on balance.",
  },
  {
    id: "BP-004", name: "Column base plate", category: "Steel connection", method: "CNC Plasma", material: "Plate", grade: "S355JR",
    w: 600, h: 600, thk: 40, holes: [ { x: 90, y: 90, d: 39 }, { x: 510, y: 90, d: 39 }, { x: 90, y: 510, d: 39 }, { x: 510, y: 510, d: 39 } ],
    qty: 12, unitMass: 113.0, tolerance: "±1.5 mm", finish: "Shop primer", factory: "ArcelorMittal SA", status: "QA / Inspection", progress: 88, due: "05 Aug", site: "Sandton Gate · Transfer L4", rev: "B",
    outstanding: "All cut + drilled; 3 awaiting dimensional sign-off before dispatch.",
  },
  {
    id: "GP-231", name: "Bracing gusset plate", category: "Steel connection", method: "CNC Laser", material: "Plate", grade: "S355JR",
    w: 480, h: 380, thk: 16, holes: [ { x: 80, y: 80, d: 22 }, { x: 240, y: 80, d: 22 }, { x: 400, y: 80, d: 22 }, { x: 160, y: 300, d: 22 }, { x: 320, y: 300, d: 22 } ],
    qty: 64, unitMass: 9.6, tolerance: "±1.0 mm", finish: "Hot-dip galvanised", factory: "Cape Alloys", status: "For Fabrication", progress: 8, due: "22 Aug", site: "Sandton Gate · Outrigger L26", rev: "A",
    outstanding: "Released to fab; nesting scheduled — no parts cut yet.",
  },
  {
    id: "CB-047", name: "Curtain-wall mullion bracket", category: "Façade", method: "CNC Milling", material: "Aluminium billet", grade: "6082-T6",
    w: 180, h: 120, thk: 12, holes: [ { x: 40, y: 40, d: 14 }, { x: 140, y: 40, d: 14 }, { x: 90, y: 90, d: 18 } ],
    qty: 420, unitMass: 0.9, tolerance: "±0.2 mm", finish: "Anodised", factory: "Meridian Façades", status: "In Fabrication", progress: 71, due: "18 Aug", site: "Sandton Gate · façade zones 3–6", rev: "D",
    outstanding: "298 machined; slot-milling on remaining 122; anodising batched weekly.",
  },
  {
    id: "EP-012", name: "Cast-in embed plate + studs", category: "Precast", method: "Boilermaker / Weld", material: "Plate + studs", grade: "S275 / SD1",
    w: 300, h: 300, thk: 12, holes: [], qty: 96, unitMass: 8.4, tolerance: "±2.0 mm", finish: "Bright", factory: "AfriSam Precast", status: "Dispatched", progress: 100, due: "28 Jul", site: "Sandton Gate · core walls", rev: "B",
    outstanding: "Complete — 96 dispatched; awaiting cast-in confirmation from site.",
  },
  {
    id: "ST-003", name: "Stair stringer (spiral)", category: "Metalwork", method: "CNC Plasma", material: "Plate + RHS", grade: "S355JR",
    w: 900, h: 260, thk: 10, holes: [ { x: 80, y: 130, d: 18 }, { x: 820, y: 130, d: 18 } ], qty: 8, unitMass: 46.0, tolerance: "±2.0 mm", finish: "Powder-coat", factory: "Cape Alloys", status: "Detailing", progress: 0, due: "02 Sep", site: "Sandton Gate · fire stairs", rev: "A",
    outstanding: "Detailing 80% — awaiting engineer approval of tread connection.",
  },
  {
    id: "PN-090", name: "Machined clevis pin", category: "Mechanical", method: "CNC Milling", material: "Round bar", grade: "EN24T",
    w: 160, h: 60, thk: 60, holes: [ { x: 30, y: 30, d: 20 }, { x: 130, y: 30, d: 20 } ], qty: 24, unitMass: 2.1, tolerance: "±0.05 mm", finish: "Zinc-plated", factory: "Precision Turned Parts", status: "Approved", progress: 0, due: "26 Aug", site: "Sandton Gate · outrigger pins", rev: "B",
    outstanding: "Approved for fab; turning + keyway milling to be scheduled.",
  },
  {
    id: "HR-210", name: "Handrail bracket", category: "Metalwork", method: "CNC Laser", material: "Plate", grade: "S275",
    w: 140, h: 100, thk: 8, holes: [ { x: 35, y: 35, d: 12 }, { x: 105, y: 35, d: 12 }, { x: 70, y: 80, d: 10 } ], qty: 260, unitMass: 0.6, tolerance: "±0.5 mm", finish: "Powder-coat", factory: "Cape Alloys", status: "In Fabrication", progress: 44, due: "20 Aug", site: "Sandton Gate · balconies", rev: "C",
    outstanding: "115 cut + bent; welding of gusset + coating on balance.",
  },
];

export const statusIndex = (s: PartStatus) => STATUS_ORDER.indexOf(s);

export const methodColor: Record<FabMethod, string> = {
  "CNC Laser": "#6d7cff",
  "CNC Plasma": "#38bdf8",
  "CNC Milling": "#a855f7",
  "Press Brake": "#34d399",
  "Boilermaker / Weld": "#fbbf24",
  "Cast-in": "#fb7185",
  Extrusion: "#60a5fa",
};

export const statusColor = (s: PartStatus) =>
  s === "Installed" || s === "Dispatched" ? "text-positive" : s === "QA / Inspection" ? "text-info" : s === "Detailing" ? "text-fg-faint" : "text-caution";

export const totalMass = (p: Part) => p.qty * p.unitMass;
