"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const suggestions = [
  "Why is Sandton Gate behind schedule?",
  "Which projects are most at risk, and why?",
  "Where are we over benchmark on procurement?",
  "Summarise this morning's War Room for the board.",
];

export function AssistantTrigger() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("atlas:assistant"))}
      className="flex items-center gap-2 rounded-md border border-edge bg-surface px-3 py-1.5 text-sm text-fg-muted transition hover:border-edge-strong hover:text-fg"
    >
      <span className="text-accent">✦</span>
      Ask Atlas
    </button>
  );
}

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendRef = useRef<(text: string) => void>(() => {});

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onAsk = (e: Event) => {
      setOpen(true);
      const q = (e as CustomEvent<string>).detail;
      if (q) setTimeout(() => sendRef.current(q), 80);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("atlas:assistant", onOpen);
    window.addEventListener("atlas:ask", onAsk as EventListener);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("atlas:assistant", onOpen);
      window.removeEventListener("atlas:ask", onAsk as EventListener);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, streaming]);

  const send = useCallback(
    async (text: string) => {
      const q = text.trim();
      if (!q || streaming) return;
      const next: Msg[] = [...messages, { role: "user", content: q }];
      setMessages(next);
      setInput("");
      setStreaming(true);
      // Placeholder assistant turn we stream into.
      setMessages((m) => [...m, { role: "assistant", content: "" }]);

      try {
        const res = await fetch("/api/atlas", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ messages: next }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const msg = data.message ?? `Request failed (${res.status}).`;
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: msg };
            return copy;
          });
          return;
        }

        const reader = res.body?.getReader();
        if (!reader) return;
        const decoder = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += decoder.decode(value, { stream: true });
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = { role: "assistant", content: acc };
            return copy;
          });
        }
      } catch {
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: "Network error reaching the assistant." };
          return copy;
        });
      } finally {
        setStreaming(false);
      }
    },
    [messages, streaming],
  );

  useEffect(() => {
    sendRef.current = send;
  }, [send]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex justify-end" role="dialog" aria-modal>
      <div className="flex-1 bg-black/40" onClick={() => setOpen(false)} />
      <div className="flex h-full w-full max-w-md flex-col border-l border-edge bg-base shadow-2xl shadow-black/40">
        {/* header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-edge px-5">
          <div className="flex items-center gap-2">
            <span className="text-accent">✦</span>
            <span className="text-sm font-semibold text-fg">Ask Atlas</span>
            <span className="rounded border border-edge px-1.5 py-0.5 font-mono text-[10px] text-fg-faint">
              opus-4.8
            </span>
          </div>
          <button onClick={() => setOpen(false)} className="text-fg-faint hover:text-fg">
            ✕
          </button>
        </div>

        {/* messages */}
        <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {messages.length === 0 && (
            <div className="pt-6">
              <p className="text-sm text-fg-muted">
                Ask about the portfolio — risks, schedule, procurement, cashflow. Answers are grounded
                in live project data.
              </p>
              <div className="mt-4 space-y-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="block w-full rounded-md border border-edge bg-surface px-3 py-2 text-left text-sm text-fg-muted transition hover:border-edge-strong hover:text-fg"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3.5 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-accent/15 text-fg"
                    : "border border-edge bg-surface text-fg-muted"
                }`}
              >
                {m.content || (streaming && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-faint" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-faint [animation-delay:150ms]" />
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-fg-faint [animation-delay:300ms]" />
                  </span>
                ) : null)}
              </div>
            </div>
          ))}
        </div>

        {/* input */}
        <div className="border-t border-edge p-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about any project…"
              className="flex-1 rounded-md border border-edge bg-surface px-3 py-2 text-sm text-fg outline-none placeholder:text-fg-faint focus:border-accent"
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:opacity-40"
            >
              Send
            </button>
          </form>
          <p className="mt-1.5 text-[11px] text-fg-faint">
            Atlas can be wrong — verify decisions against source records.
          </p>
        </div>
      </div>
    </div>
  );
}
