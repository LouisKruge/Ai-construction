import Sidebar from "@/components/Sidebar";
import CommandPalette from "@/components/CommandPalette";
import Assistant, { AssistantTrigger } from "@/components/Assistant";
import ProjectSelector from "@/components/ProjectSelector";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <CommandPalette />
      <Assistant />
      <div className="pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-edge bg-base/70 px-6 backdrop-blur-xl">
          <ProjectSelector />

          <div className="flex items-center gap-2">
            <AssistantTrigger />
            <button className="relative flex items-center gap-2 rounded-lg border border-edge bg-surface/60 px-3 py-1.5 text-xs text-fg-muted transition hover:border-edge-strong hover:text-fg">
              <span>🔔</span>
              <span className="hidden sm:inline">Notifications</span>
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">12</span>
            </button>
            <div className="ml-1 flex items-center gap-2.5 border-l border-edge pl-3">
              <div className="hidden text-right sm:block">
                <div className="text-[13px] font-medium leading-tight text-fg">Stefan K.</div>
                <div className="text-[10px] leading-tight text-fg-faint">Project Director</div>
              </div>
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-semibold text-white">
                SK
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-6 py-6">{children}</main>
      </div>
    </div>
  );
}
