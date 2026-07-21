import Sidebar from "@/components/Sidebar";
import CommandPalette, { PaletteTrigger } from "@/components/CommandPalette";
import Assistant, { AssistantTrigger } from "@/components/Assistant";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <CommandPalette />
      <Assistant />
      <div className="pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-edge bg-base/70 px-8 backdrop-blur-xl">
          <PaletteTrigger />
          <div className="flex items-center gap-3 text-xs text-fg-faint">
            <AssistantTrigger />
            <span className="hidden items-center gap-1.5 rounded-full border border-edge bg-surface/60 px-2.5 py-1 md:flex">
              <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
              All agents operational
            </span>
            <span className="hidden rounded-full border border-edge bg-surface/60 px-2.5 py-1 md:inline">
              21 Jul 2026
            </span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-edge bg-gradient-to-br from-raise to-surface text-[11px] font-semibold text-fg-muted">
              LK
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
