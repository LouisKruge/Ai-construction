"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navGroups: {
  label: string;
  items: { href: string; label: string; icon: string }[];
}[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Command Center", icon: "◈" },
      { href: "/projects", label: "Projects", icon: "▦" },
      { href: "/intelligence", label: "Intelligence", icon: "◎" },
      { href: "/analytics", label: "Analytics", icon: "∿" },
    ],
  },
  {
    label: "Studios",
    items: [
      { href: "/design", label: "Design", icon: "◧" },
      { href: "/engineering", label: "Engineering", icon: "⌖" },
      { href: "/manufacturing", label: "Manufacturing", icon: "⚙" },
      { href: "/construction", label: "Construction", icon: "▲" },
      { href: "/quality", label: "Quality", icon: "✓" },
      { href: "/safety", label: "Safety", icon: "✚" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/procurement", label: "Procurement", icon: "⇄" },
      { href: "/finance", label: "Finance", icon: "Σ" },
      { href: "/sales", label: "Sales", icon: "◔" },
      { href: "/clients", label: "Clients", icon: "◉" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/agents", label: "AI Workforce", icon: "⬢" },
      { href: "/documents", label: "Documents", icon: "≡" },
      { href: "/twin", label: "Digital Twin", icon: "⬡" },
      { href: "/marketplace", label: "Marketplace", icon: "⊞" },
      { href: "/settings", label: "Settings", icon: "⚒" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-edge bg-base/80 text-fg-muted backdrop-blur-xl">
      <Link href="/" className="flex h-14 shrink-0 items-center gap-2.5 border-b border-edge px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white shadow-lg shadow-accent/30">
          A
        </span>
        <span className="text-[15px] font-semibold tracking-tight text-fg">Atlas</span>
        <span className="ml-auto rounded border border-edge px-1.5 py-0.5 text-[10px] font-medium tracking-wider text-fg-faint">
          OS
        </span>
      </Link>

      {/* active project pill */}
      <div className="border-b border-edge px-3 py-3">
        <div className="glass flex items-center gap-2 rounded-lg px-3 py-2">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
          <div className="min-w-0">
            <div className="truncate text-xs font-medium text-fg">Sandton Gate Tower</div>
            <div className="text-[10px] text-fg-faint">PRJ-0142 · Live</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {navGroups.map((g) => (
          <div key={g.label} className="mb-5">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
              {g.label}
            </div>
            <div className="space-y-px">
              {g.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] transition-all duration-150 ${
                      active
                        ? "bg-gradient-to-r from-accent/15 to-transparent font-medium text-fg"
                        : "hover:bg-surface hover:text-fg"
                    }`}
                  >
                    {active && (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-gradient-to-b from-accent to-accent-2 shadow-[0_0_8px_var(--color-accent)]" />
                    )}
                    <span
                      className={`w-4 text-center text-[13px] ${
                        active ? "text-accent" : "text-fg-faint group-hover:text-fg-muted"
                      }`}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-edge px-5 py-3.5 text-xs text-fg-faint">
        <div className="font-medium text-fg-muted">Meridian Construction Group</div>
        <div className="mt-0.5 flex items-center justify-between">
          <span>Enterprise · 6 projects</span>
          <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
        </div>
      </div>
    </aside>
  );
}
