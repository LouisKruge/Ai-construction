import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-ink-100 bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3.5">
      <h2 className="text-sm font-semibold text-ink-900">{title}</h2>
      {right}
    </div>
  );
}

export function Kpi({
  label,
  value,
  sub,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "positive" | "caution" | "critical";
}) {
  const toneCls = {
    neutral: "text-ink-900",
    positive: "text-positive",
    caution: "text-caution",
    critical: "text-critical",
  }[tone];
  return (
    <Card className="p-5">
      <div className="text-xs font-medium uppercase tracking-wider text-ink-400">{label}</div>
      <div className={`mt-2 text-2xl font-semibold ${toneCls}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-400">{sub}</div>}
    </Card>
  );
}

const badgeTones: Record<string, string> = {
  "On track": "bg-green-50 text-positive border-green-200",
  Passed: "bg-green-50 text-positive border-green-200",
  Awarded: "bg-green-50 text-positive border-green-200",
  Shipped: "bg-green-50 text-positive border-green-200",
  "At risk": "bg-amber-50 text-caution border-amber-200",
  Evaluating: "bg-amber-50 text-caution border-amber-200",
  QA: "bg-amber-50 text-caution border-amber-200",
  "In review": "bg-blue-50 text-blue-700 border-blue-200",
  "In production": "bg-blue-50 text-blue-700 border-blue-200",
  Open: "bg-blue-50 text-blue-700 border-blue-200",
  Delayed: "bg-red-50 text-critical border-red-200",
  "Issues found": "bg-red-50 text-critical border-red-200",
  Tender: "bg-ink-50 text-ink-400 border-ink-100",
  Draft: "bg-ink-50 text-ink-400 border-ink-100",
  Queued: "bg-ink-50 text-ink-400 border-ink-100",
};

export function Badge({ label }: { label: string }) {
  const tone = badgeTones[label] ?? "bg-ink-50 text-ink-400 border-ink-100";
  return (
    <span
      className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone}`}
    >
      {label}
    </span>
  );
}

export function Progress({
  value,
  tone = "neutral",
}: {
  value: number;
  tone?: "neutral" | "caution" | "critical";
}) {
  const bar = {
    neutral: "bg-signal-500",
    caution: "bg-caution",
    critical: "bg-critical",
  }[tone];
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-100">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

export function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-ink-100 text-left text-xs uppercase tracking-wider text-ink-400">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100">{children}</tbody>
      </table>
    </div>
  );
}
