"use client";

// Global top bar: project switcher, search, Ask Atlas, notifications, help.
const openPalette = () => window.dispatchEvent(new Event("atlas:palette"));
const openAssistant = () => window.dispatchEvent(new Event("atlas:assistant"));

export default function TopBar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-edge bg-base/70 px-6 backdrop-blur-xl">
      {/* project selector */}
      <button
        onClick={openPalette}
        className="flex shrink-0 items-center gap-2.5 rounded-lg border border-edge bg-surface/60 px-3 py-2 text-sm transition hover:border-edge-strong"
      >
        <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-accent to-accent-2 text-[10px] text-white">▲</span>
        <span className="hidden font-medium text-fg md:inline">Sandton Gate Mixed-Use Tower</span>
        <span className="text-fg-faint">▾</span>
        <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
          <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Live
        </span>
      </button>

      {/* search */}
      <button
        onClick={openPalette}
        className="flex flex-1 items-center gap-3 rounded-lg border border-edge bg-surface/40 px-3.5 py-2 text-sm text-fg-faint transition hover:border-edge-strong hover:text-fg-muted"
      >
        <span>⌕</span>
        <span className="flex-1 text-left">Search Atlas…</span>
        <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
      </button>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-2">
        <button
          onClick={openAssistant}
          className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-accent to-accent-2 px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110"
        >
          <span>✦</span> Ask Atlas
        </button>
        <button className="relative flex items-center gap-2 rounded-lg border border-edge bg-surface/60 px-3 py-2 text-sm text-fg-muted transition hover:border-edge-strong hover:text-fg">
          <span>🔔</span>
          <span className="hidden lg:inline">Notifications</span>
          <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">12</span>
        </button>
        <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-edge bg-surface/60 text-fg-muted transition hover:border-edge-strong hover:text-fg">
          ?
        </button>
      </div>
    </header>
  );
}
