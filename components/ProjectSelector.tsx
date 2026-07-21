"use client";

// Top-bar project switcher. Opens the command palette (⌘K) to jump projects.
export default function ProjectSelector() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("atlas:palette"))}
      className="flex items-center gap-2.5 rounded-lg border border-edge bg-surface/60 px-3 py-1.5 text-sm transition hover:border-edge-strong"
    >
      <span className="flex h-5 w-5 items-center justify-center rounded bg-gradient-to-br from-accent to-accent-2 text-[10px] text-white">
        ▲
      </span>
      <span className="font-medium text-fg">Sandton Gate Mixed-Use Tower</span>
      <span className="text-fg-faint">▾</span>
      <span className="ml-1 inline-flex items-center gap-1 rounded-full border border-positive/30 bg-positive/10 px-2 py-0.5 text-[10px] font-medium text-positive">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> Live
      </span>
    </button>
  );
}
