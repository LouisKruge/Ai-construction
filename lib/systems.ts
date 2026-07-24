// ── Building systems model ─────────────────────────────────────────────────
// One definition of every discipline a complete building needs, with how far
// each is installed derived from the shared construction progress (structure
// floors S, facade/fit-out floors F). Used by the Construction Systems tracker
// and by the 3D model's toggleable coloured service layers.

export type SystemId =
  | "found"
  | "structure"
  | "facade"
  | "lifts"
  | "electrical"
  | "fire"
  | "plumbing"
  | "hvac"
  | "ict"
  | "finishes"
  | "commissioning";

export interface BuildingSystem {
  id: SystemId;
  name: string;
  color: string;
  contractor: string;
  note: string;
  done: number; // floors installed
  riser: boolean; // renders as a vertical service layer in the 3D model
}

export function buildingSystems(floors: number, S: number, F: number): BuildingSystem[] {
  const cl = (n: number) => Math.max(0, Math.min(floors, Math.round(n)));
  return [
    { id: "found", name: "Foundations & substructure", color: "#94a3b8", contractor: "AfriSam", note: "Piling, pile caps, rafts, basement box", done: floors, riser: false },
    { id: "structure", name: "Structure — pillars, cores & slabs", color: "#6d7cff", contractor: "ArcelorMittal SA", note: "RC columns, core walls, PT slabs", done: cl(S), riser: false },
    { id: "facade", name: "Envelope — façade & glazing", color: "#38bdf8", contractor: "Meridian Façades", note: "Curtain wall, spandrels, waterproofing", done: cl(F), riser: false },
    { id: "lifts", name: "Vertical transport — lifts & escalators", color: "#a855f7", contractor: "KONE", note: "Shaft rails, cars, machine rooms", done: cl(S - 3), riser: true },
    { id: "electrical", name: "Electrical & power", color: "#fbbf24", contractor: "Ingérop", note: "Risers, DBs, containment, 1st + 2nd fix", done: cl(F - 1), riser: true },
    { id: "fire", name: "Fire — sprinklers, detection & egress", color: "#fb7185", contractor: "ASP Fire", note: "Sprinkler mains, hydrants, detection, pressurisation", done: cl(F - 1), riser: true },
    { id: "plumbing", name: "Plumbing & wet services", color: "#22d3ee", contractor: "Aqua Services", note: "Soil, waste, water reticulation, pumps", done: cl(F), riser: true },
    { id: "hvac", name: "HVAC & mechanical", color: "#34d399", contractor: "AOS Mechanical", note: "AHUs, ducting, chilled water, VAV", done: cl(F - 1), riser: true },
    { id: "ict", name: "ICT, data & security", color: "#60a5fa", contractor: "BT Comms", note: "Backbone, racks, CCTV, access control", done: cl(F - 2), riser: true },
    { id: "finishes", name: "Interior finishes & fit-out", color: "#f0abfc", contractor: "Tri-Star Interiors", note: "Partitions, ceilings, floors, joinery", done: cl(F - 2), riser: false },
    { id: "commissioning", name: "Commissioning & handover", color: "#a3e635", contractor: "Atlas PM", note: "Balancing, integrated test, O&M, occupation cert", done: cl(F - 4), riser: false },
  ];
}
