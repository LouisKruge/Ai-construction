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
        <h1 className="text-xl font-semibold tracking-tight text-fg">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-fg-faint">{subtitle}</p>}
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
    <div className={`rounded-xl border border-edge bg-surface ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, right }: { title: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-edge px-5 py-3.5">
      <h2 className="text-[13px] font-semibold uppercase tracking-wider text-fg-muted">
        {title}
      </h2>
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
    neutral: "text-fg",
    positive: "text-positive",
    caution: "text-caution",
    critical: "text-critical",
  }[tone];
  return (
    <Card className="p-5">
      <div className="text-[11px] font-medium uppercase tracking-widest text-fg-faint">
        {label}
      </div>
      <div className={`mt-2 text-2xl font-semibold tracking-tight ${toneCls}`}>{value}</div>
      {sub && <div className="mt-1 text-xs text-fg-faint">{sub}</div>}
    </Card>
  );
}

// Status dots: state is carried by a small colored dot; the pill itself stays
// monochrome so tables read calmly at density.
const badgeDots: Record<string, string> = {
  "On track": "bg-positive",
  Passed: "bg-positive",
  Awarded: "bg-positive",
  Shipped: "bg-positive",
  Resolved: "bg-positive",
  "At risk": "bg-caution",
  Evaluating: "bg-caution",
  QA: "bg-caution",
  "In review": "bg-info",
  "In production": "bg-info",
  Open: "bg-info",
  Delayed: "bg-critical",
  "Issues found": "bg-critical",
  Overdue: "bg-critical",
  Tender: "bg-fg-faint",
  Draft: "bg-fg-faint",
  Queued: "bg-fg-faint",
};

export function Badge({ label }: { label: string }) {
  const dot = badgeDots[label] ?? "bg-fg-faint";
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-edge bg-raise/60 px-2.5 py-0.5 text-xs font-medium text-fg-muted">
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
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
    neutral: "bg-fg-muted",
    caution: "bg-caution",
    critical: "bg-critical",
  }[tone];
  return (
    <div className="h-1 w-full overflow-hidden rounded-full bg-edge">
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
          <tr className="border-b border-edge text-left text-[11px] uppercase tracking-widest text-fg-faint">
            {headers.map((h) => (
              <th key={h} className="px-5 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">{children}</tbody>
      </table>
    </div>
  );
}
