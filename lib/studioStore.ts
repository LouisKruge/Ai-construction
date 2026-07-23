import { create } from "zustand";

// ── Shared, linked project state for the Design Studio workspace ───────────
// Every tab (3D / Plans / Sections / Elevations / Materials / Lighting /
// Analysis) reads and writes this single parametric BIM model, so a change in
// one tab immediately propagates to all the others.

export type StudioMode = "3d" | "plans" | "sections" | "elevations" | "materials" | "lighting" | "analysis";
export type RenderMode = "shaded" | "realistic" | "wireframe" | "xray" | "structural";

export interface Material {
  id: string;
  name: string;
  color: string;
  roughness: number;
  metalness: number;
  opacity: number;
  density: number; // kg/m³
  carbon: number; // kgCO₂e/kg (embodied)
  cost: number; // R / m²
  fire: string;
  supplier: string;
}

export const MATERIALS: Material[] = [
  { id: "glass-lowe", name: "Low-E Curtain Wall Glass", color: "#2b4a5e", roughness: 0.07, metalness: 0.0, opacity: 0.5, density: 2500, carbon: 1.1, cost: 3200, fire: "A1", supplier: "Meridian Façades" },
  { id: "glass-tinted", name: "Solar-Tinted Glazing", color: "#26493f", roughness: 0.09, metalness: 0.0, opacity: 0.55, density: 2500, carbon: 1.3, cost: 3600, fire: "A1", supplier: "Meridian Façades" },
  { id: "alu", name: "Anodised Aluminium", color: "#b6c0cf", roughness: 0.4, metalness: 0.92, opacity: 1, density: 2700, carbon: 8.2, cost: 1850, fire: "A1", supplier: "Cape Alloys" },
  { id: "concrete", name: "C40/50 Concrete", color: "#8b95a3", roughness: 0.85, metalness: 0.1, opacity: 1, density: 2400, carbon: 0.13, cost: 1650, fire: "A1", supplier: "AfriSam" },
  { id: "steel", name: "S355 Structural Steel", color: "#7d8794", roughness: 0.45, metalness: 0.85, opacity: 1, density: 7850, carbon: 1.55, cost: 24000, fire: "R60", supplier: "ArcelorMittal SA" },
  { id: "clt", name: "Cross-Laminated Timber", color: "#b8895a", roughness: 0.75, metalness: 0.0, opacity: 1, density: 480, carbon: -0.9, cost: 2400, fire: "R60", supplier: "XLam" },
  { id: "brick", name: "Face Brick", color: "#8a4a3a", roughness: 0.9, metalness: 0.0, opacity: 1, density: 1900, carbon: 0.24, cost: 1200, fire: "A1", supplier: "Corobrik" },
  { id: "stone", name: "Granite Cladding", color: "#5b5f66", roughness: 0.6, metalness: 0.05, opacity: 1, density: 2700, carbon: 0.7, cost: 4200, fire: "A1", supplier: "Marlin Stone" },
];

export interface StudioState {
  // parametric envelope
  floors: number;
  floorHeight: number; // m
  width: number; // m
  depth: number; // m
  facadeGlassPct: number; // 0-100
  facadeMaterialId: string;
  structureMaterialId: string;
  // navigation / viewport
  mode: StudioMode;
  renderMode: RenderMode;
  activeFloor: number;
  selected: string | null;
  timeOfDay: number; // hours 5..20
  // element visibility
  hidden: Record<string, boolean>;

  setMode: (m: StudioMode) => void;
  setRenderMode: (r: RenderMode) => void;
  setFloors: (n: number) => void;
  setActiveFloor: (n: number) => void;
  setSelected: (s: string | null) => void;
  setTimeOfDay: (t: number) => void;
  setFacadeMaterial: (id: string) => void;
  setGlassPct: (n: number) => void;
  setWidth: (n: number) => void;
  setDepth: (n: number) => void;
  toggleHidden: (id: string) => void;
}

export const useStudio = create<StudioState>((set) => ({
  floors: 22,
  floorHeight: 3.4,
  width: 34,
  depth: 24,
  facadeGlassPct: 68,
  facadeMaterialId: "glass-lowe",
  structureMaterialId: "concrete",
  mode: "3d",
  renderMode: "realistic",
  activeFloor: 12,
  selected: null,
  timeOfDay: 17.5,
  hidden: {},

  setMode: (mode) => set({ mode }),
  setRenderMode: (renderMode) => set({ renderMode }),
  setFloors: (floors) => set((s) => ({ floors: clamp(floors, 6, 40), activeFloor: Math.min(s.activeFloor, clamp(floors, 6, 40)) })),
  setActiveFloor: (activeFloor) => set({ activeFloor }),
  setSelected: (selected) => set({ selected }),
  setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
  setFacadeMaterial: (facadeMaterialId) => set({ facadeMaterialId }),
  setGlassPct: (facadeGlassPct) => set({ facadeGlassPct: clamp(facadeGlassPct, 30, 95) }),
  setWidth: (width) => set({ width: clamp(width, 18, 60) }),
  setDepth: (depth) => set({ depth: clamp(depth, 14, 44) }),
  toggleHidden: (id) => set((s) => ({ hidden: { ...s.hidden, [id]: !s.hidden[id] } })),
}));

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ── derived quantities (single source of truth for every tab) ──────────────
export function metrics(s: StudioState) {
  const height = s.floors * s.floorHeight;
  const gfaPerFloor = s.width * s.depth;
  const gfa = gfaPerFloor * s.floors;
  const footprint = gfaPerFloor;
  const facadeArea = 2 * (s.width + s.depth) * height;
  const glassArea = facadeArea * (s.facadeGlassPct / 100);
  const mat = MATERIALS.find((m) => m.id === s.facadeMaterialId)!;
  const struct = MATERIALS.find((m) => m.id === s.structureMaterialId)!;
  // rough quantities
  const concreteVol = gfa * 0.28; // m³ (slabs+cores)
  const facadeCost = glassArea * mat.cost + (facadeArea - glassArea) * MATERIALS.find((m) => m.id === "alu")!.cost;
  const structCost = concreteVol * struct.cost * 0.0 + gfa * 4200; // R/m² structure allowance
  const totalCost = facadeCost + structCost + gfa * 9800; // + fit-out/services allowance
  const embodiedCarbon = (glassArea * mat.density * 0.02 * mat.carbon + concreteVol * struct.density * struct.carbon) / 1000; // tCO₂e
  // daylight factor rough model
  const daylightFactor = Math.min(9, (s.facadeGlassPct / 100) * 10 * (1 - s.depth / 120));
  const eui = 120 - s.facadeGlassPct * 0.15 + s.depth * 0.6; // kWh/m²·yr rough
  return {
    height, gfa, gfaPerFloor, footprint, facadeArea, glassArea, concreteVol,
    totalCost, embodiedCarbon, daylightFactor, eui, mat, struct,
  };
}

export const fmtR = (n: number) => (n >= 1e6 ? `R ${(n / 1e6).toFixed(1)}m` : `R ${(n / 1e3).toFixed(0)}k`);
