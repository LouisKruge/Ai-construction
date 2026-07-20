import Sidebar from "@/components/Sidebar";

export default function PlatformLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-screen bg-ink-50">
      <Sidebar />
      <div className="pl-60">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-ink-100 bg-white/90 px-8 backdrop-blur">
          <input
            type="search"
            placeholder="Ask Atlas anything — “Why is Sandton Gate behind schedule?”"
            className="w-[28rem] max-w-full rounded-md border border-ink-100 bg-ink-50 px-4 py-2 text-sm outline-none placeholder:text-ink-400 focus:border-signal-500"
          />
          <div className="flex items-center gap-4 text-sm text-ink-400">
            <span className="hidden md:inline">Sun 20 Jul 2026</span>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-700 text-xs font-semibold text-white">
              LK
            </span>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
