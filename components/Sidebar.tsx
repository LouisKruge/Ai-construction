"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const groups: { label: string; items: { href: string; label: string; icon: string }[] }[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Command Center", icon: "◈" },
      { href: "/projects", label: "Projects", icon: "▦" },
      { href: "/analytics", label: "Analytics", icon: "∿" },
    ],
  },
  {
    label: "Delivery",
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
    label: "Commercial",
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
    <aside className="fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-ink-700 bg-ink-900 text-ink-300">
      <Link href="/" className="flex h-16 shrink-0 items-center gap-2 border-b border-ink-700 px-5">
        <span className="flex h-7 w-7 items-center justify-center rounded bg-signal-500 font-bold text-white">
          A
        </span>
        <span className="text-lg font-semibold tracking-tight text-white">Atlas</span>
      </Link>
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <div className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-ink-400">
              {g.label}
            </div>
            <div className="space-y-0.5">
              {g.items.map((item) => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-md px-3 py-1.5 text-sm transition ${
                      active
                        ? "bg-ink-700 font-medium text-white"
                        : "hover:bg-ink-800 hover:text-white"
                    }`}
                  >
                    <span className="w-4 text-center text-signal-400">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-ink-700 px-5 py-4 text-xs text-ink-400">
        <div className="font-medium text-ink-300">Meridian Construction Group</div>
        <div className="mt-0.5">Enterprise plan · 6 active projects</div>
      </div>
    </aside>
  );
}
