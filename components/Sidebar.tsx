"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navGroups: {
  label: string;
  items: { href: string; label: string; icon: string }[];
}[] = [
  {
    label: "",
    items: [
      { href: "/dashboard", label: "Command Center", icon: "◈" },
      { href: "/projects", label: "Projects", icon: "▦" },
      { href: "/intelligence", label: "AI Intelligence", icon: "◎" },
      { href: "/analytics", label: "Analytics", icon: "∿" },
    ],
  },
  {
    label: "Studios",
    items: [
      { href: "/design", label: "Design Studio", icon: "◧" },
      { href: "/engineering", label: "Engineering Studio", icon: "⌖" },
      { href: "/construction", label: "Construction Studio", icon: "▲" },
      { href: "/manufacturing", label: "Manufacturing Studio", icon: "⚙" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/procurement", label: "Procurement", icon: "⇄" },
      { href: "/finance", label: "Finance", icon: "Σ" },
      { href: "/agents", label: "Workforce", icon: "⬢" },
      { href: "/schedule", label: "Schedule", icon: "▤" },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/marketplace", label: "Marketplace", icon: "⊞" },
      { href: "/documents", label: "Documents", icon: "≡" },
      { href: "/twin", label: "Digital Twin", icon: "⬡" },
      { href: "/settings", label: "Settings", icon: "⚒" },
    ],
  },
];

// Modules reachable via ⌘K but not pinned in the photo's sidebar.
export const extraRoutes: { href: string; label: string }[] = [
  { href: "/quality", label: "Quality" },
  { href: "/safety", label: "Safety" },
  { href: "/sales", label: "Sales" },
  { href: "/clients", label: "Clients" },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-edge bg-base/80 text-fg-muted backdrop-blur-xl">
      <Link href="/" className="flex h-14 shrink-0 items-center gap-2.5 border-b border-edge px-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-lg shadow-accent/30">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="white" strokeWidth="2" strokeLinejoin="round">
            <path d="M12 3 L21 8 L21 16 L12 21 L3 16 L3 8 Z" />
            <path d="M12 3 L12 21 M3 8 L21 16 M21 8 L3 16" strokeWidth="1" strokeOpacity="0.6" />
          </svg>
        </span>
        <span className="text-[16px] font-bold tracking-[0.18em] text-fg">ATLAS</span>
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {navGroups.map((g, gi) => (
          <div key={g.label || gi} className="mb-5">
            {g.label && (
              <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-fg-faint">
                {g.label}
              </div>
            )}
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
      <button className="flex items-center gap-3 border-t border-edge px-5 py-3.5 text-[13px] text-fg-faint transition hover:text-fg-muted">
        <span className="w-4 text-center">‹</span>
        Collapse
      </button>
    </aside>
  );
}
