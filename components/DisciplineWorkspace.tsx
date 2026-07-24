"use client";

import { useEffect, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useStudio, type RenderMode } from "@/lib/studioStore";

const StudioViewport = dynamic(() => import("@/components/StudioViewport"), {
  ssr: false,
  loading: () => (
    <div className="blueprint flex h-full w-full items-center justify-center bg-base">
      <span className="animate-pulse text-xs text-fg-faint">Loading engine…</span>
    </div>
  ),
});

export const ask = (q: string) => {
  window.dispatchEvent(new Event("atlas:assistant"));
  setTimeout(() => window.dispatchEvent(new CustomEvent("atlas:ask", { detail: q })), 80);
};

export interface WsTab {
  id: string;
  label: string;
  icon: ReactNode;
  ai: string;
  is3D?: boolean;
  renderMode?: RenderMode;
  clashes?: boolean;
  toolbar?: ReactNode;
  content?: ReactNode;
  inspector?: ReactNode;
}

export function Row({ k, v, tone = "text-fg" }: { k: string; v: ReactNode; tone?: string }) {
  return (
    <div className="flex items-center justify-between border-b border-edge/50 py-1.5 text-[12px] last:border-0">
      <span className="text-fg-faint">{k}</span>
      <span className={`font-medium ${tone}`}>{v}</span>
    </div>
  );
}

export default function DisciplineWorkspace({
  title,
  subtitle,
  status = "Synced",
  tabs,
}: {
  title: string;
  subtitle: string;
  status?: string;
  tabs: WsTab[];
}) {
  const [active, setActive] = useState(tabs[0].id);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const setRenderMode = useStudio((s) => s.setRenderMode);
  const setShowClashes = useStudio((s) => s.setShowClashes);

  useEffect(() => {
    if (tab.is3D && tab.renderMode) setRenderMode(tab.renderMode);
    setShowClashes(!!tab.clashes);
    return () => setShowClashes(false);
  }, [tab, setRenderMode, setShowClashes]);

  return (
    <div className="glass glow sheen relative overflow-hidden rounded-2xl">
      {/* header */}
      <div className="flex items-start justify-between px-5 pt-5">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-fg">{title}</h2>
          <p className="text-[13px] text-fg-faint">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => ask(tab.ai)} className="shine flex items-center gap-1.5 rounded-lg border border-accent/40 bg-accent/15 px-2.5 py-1 text-[11px] font-medium text-fg transition hover:bg-accent/25">
            ✦ AI Copilot
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-edge bg-base/50 px-2.5 py-0.5 text-[11px] text-fg-muted">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" /> {status}
          </span>
        </div>
      </div>

      {/* tab bar */}
      <div className="mt-4 flex gap-1.5 overflow-x-auto px-5">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <button key={t.id} onClick={() => setActive(t.id)} className={`flex shrink-0 items-center gap-1.5 rounded-t-lg border-b-2 px-3 py-2 text-[12px] transition ${on ? "border-accent text-fg" : "border-transparent text-fg-faint hover:text-fg-muted"}`}>
              <svg viewBox="0 0 24 24" className={`h-4 w-4 ${on ? "text-accent" : ""}`} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{t.icon}</svg>
              {t.label}
            </button>
          );
        })}
      </div>

      {/* stage */}
      <div className="space-y-3 border-t border-edge p-3">
        {tab.is3D ? (
          <>
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-edge bg-base">
              <StudioViewport />
              {tab.toolbar && <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">{tab.toolbar}</div>}
              <div className="pointer-events-none absolute bottom-3 left-3 flex gap-1.5">
                <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-[10px] text-fg-muted backdrop-blur">BIM · Rev D</span>
                <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-[10px] text-accent-cyan backdrop-blur">WebGL · PBR · HDRI</span>
              </div>
            </div>
            {tab.inspector && <div className="rounded-xl border border-edge bg-base/40 p-3">{tab.inspector}</div>}
          </>
        ) : (
          <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
            <div className="min-w-0">{tab.content}</div>
            {tab.inspector && <div className="rounded-xl border border-edge bg-base/40 p-3">{tab.inspector}</div>}
          </div>
        )}
      </div>
    </div>
  );
}
