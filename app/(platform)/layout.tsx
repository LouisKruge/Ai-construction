import Sidebar from "@/components/Sidebar";
import CommandPalette, { PaletteTrigger } from "@/components/CommandPalette";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-base text-fg">
      <Sidebar />
      <CommandPalette />
      <div className="pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-edge bg-base/85 px-8 backdrop-blur">
          <PaletteTrigger />
          <div className="flex items-center gap-4 text-xs text-fg-faint">
            <span className="hidden items-center gap-1.5 md:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-positive" />
              All agents operational
            </span>
            <span className="hidden md:inline">Sun 20 Jul 2026</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-edge bg-surface text-[11px] font-semibold text-fg-muted">
              LK
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
