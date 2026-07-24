"use client";

// Shared interactive controls for the computation engines. Client-side, and
// deliberately minimal so each calculator stays readable.

export function Field({
  label,
  value,
  min,
  max,
  step = 1,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-fg-muted">{label}</span>
        <span className="font-mono text-xs text-fg">
          {value}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 h-1 w-full cursor-pointer appearance-none rounded-full bg-edge accent-[var(--color-accent)]"
      />
    </label>
  );
}

export function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm transition ${
        on ? "border-accent bg-accent/10 text-fg" : "border-edge text-fg-muted hover:border-edge-strong"
      }`}
    >
      <span>{label}</span>
      <span
        className={`ml-3 flex h-4 w-7 shrink-0 items-center rounded-full px-0.5 transition ${
          on ? "bg-accent" : "bg-edge-strong"
        }`}
      >
        <span
          className={`h-3 w-3 rounded-full bg-white transition ${on ? "translate-x-3" : ""}`}
        />
      </span>
    </button>
  );
}

export function Metric({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "positive" | "caution" | "critical" | "accent";
}) {
  const toneCls = {
    neutral: "text-fg",
    positive: "text-positive",
    caution: "text-caution",
    critical: "text-critical",
    accent: "text-accent",
  }[tone];
  return (
    <div className="rounded-lg border border-edge bg-base p-3">
      <div className="text-[10px] font-medium uppercase tracking-widest text-fg-faint">{label}</div>
      <div className={`mt-1 text-lg font-semibold tabular-nums ${toneCls}`}>{value}</div>
      {sub && <div className="mt-0.5 text-[11px] text-fg-faint">{sub}</div>}
    </div>
  );
}
