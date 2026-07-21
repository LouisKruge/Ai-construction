"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { navGroups } from "@/components/Sidebar";
import { projects } from "@/lib/data";

interface Command {
  id: string;
  group: string;
  label: string;
  hint?: string;
  href?: string;
  ask?: string; // when set, opens the Atlas assistant with this question
}

const aiActions: Command[] = [
  { id: "ai-1", group: "Ask Atlas", label: "Why is Sandton Gate behind schedule?", hint: "portfolio", ask: "Why is Sandton Gate behind schedule?" },
  { id: "ai-2", group: "Ask Atlas", label: "Which projects are most at risk?", hint: "portfolio", ask: "Which projects are most at risk, and why?" },
  { id: "ai-3", group: "Ask Atlas", label: "Where are we over benchmark on procurement?", hint: "procurement", ask: "Where are we over benchmark on procurement?" },
  { id: "ai-4", group: "Ask Atlas", label: "Summarise the War Room for the board", hint: "executive", ask: "Summarise this morning's War Room briefing for the board." },
];

function askAtlas(question: string) {
  window.dispatchEvent(new Event("atlas:assistant"));
  // let the drawer mount before it listens for the question
  setTimeout(() => window.dispatchEvent(new CustomEvent("atlas:ask", { detail: question })), 60);
}

const commands: Command[] = [
  ...navGroups.flatMap((g) =>
    g.items.map((i) => ({
      id: i.href,
      group: "Go to",
      label: i.label,
      hint: g.label,
      href: i.href,
    })),
  ),
  ...projects.map((p) => ({
    id: p.id,
    group: "Projects",
    label: p.name,
    hint: `${p.id} · ${p.phase}`,
    href: `/projects/${p.id}`,
  })),
  ...aiActions,
];

export function PaletteTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("atlas:palette"))}
      className="flex w-[26rem] max-w-full items-center gap-3 rounded-lg border border-edge bg-surface px-3.5 py-2 text-sm text-fg-faint transition hover:border-edge-strong hover:text-fg-muted"
    >
      <span>⌕</span>
      <span className="flex-1 text-left">Search or ask Atlas anything…</span>
      <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
    </button>
  );
}

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const results = useMemo(() => {
    const raw = query.trim();
    const q = raw.toLowerCase();
    if (!q) return commands;
    const matches = commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.hint?.toLowerCase().includes(q) ||
        c.group.toLowerCase().includes(q),
    );
    // Always offer to ask the assistant the raw query.
    const askItem: Command = {
      id: "ask-freeform",
      group: "Ask Atlas",
      label: `Ask Atlas: “${raw}”`,
      hint: "opus-4.8",
      ask: raw,
    };
    return [askItem, ...matches];
  }, [query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setIndex(0);
  }, []);

  const run = useCallback(
    (cmd: Command | undefined) => {
      if (!cmd) return;
      close();
      if (cmd.ask) {
        askAtlas(cmd.ask);
      } else if (cmd.href) {
        router.push(cmd.href);
      }
    },
    [close, router],
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    }
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("atlas:palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("atlas:palette", onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => setIndex(0), [query]);

  if (!open) return null;

  let flat = -1;
  const grouped = results.reduce<Record<string, Command[]>>((acc, c) => {
    (acc[c.group] ??= []).push(c);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 pt-[14vh] backdrop-blur-[2px]"
      onClick={close}
    >
      <div
        className="w-[38rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-edge-strong bg-overlay shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-edge px-4">
          <span className="text-fg-faint">⌕</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, results.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                run(results[index]);
              }
            }}
            placeholder="Search modules, projects, or ask Atlas to act…"
            className="h-12 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-fg-faint"
          />
          <kbd className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-fg-faint">
            esc
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto py-2">
          {results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-fg-faint">
              No matches. Try a module, project, or action.
            </div>
          )}
          {Object.entries(grouped).map(([group, cmds]) => (
            <div key={group}>
              <div className="px-4 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-fg-faint">
                {group}
              </div>
              {cmds.map((c) => {
                flat += 1;
                const i = flat;
                const active = i === index;
                return (
                  <button
                    key={c.id}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => run(c)}
                    className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm transition-colors duration-75 ${
                      active ? "bg-raise text-fg" : "text-fg-muted"
                    }`}
                  >
                    <span>{c.label}</span>
                    {c.hint && <span className="text-xs text-fg-faint">{c.hint}</span>}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 border-t border-edge px-4 py-2 text-[11px] text-fg-faint">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> open</span>
          <span className="ml-auto">Atlas OS</span>
        </div>
      </div>
    </div>
  );
}
