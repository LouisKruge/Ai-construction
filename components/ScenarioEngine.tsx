import type { Scenario } from "@/lib/workforce";
import { Card, CardHeader } from "@/components/ui";

// Renders a decision-support panel: a set of "what-if" questions, each with the
// AI's evidence-backed answer, a confidence score, and stated assumptions.
export default function ScenarioEngine({
  title,
  note,
  scenarios,
  prompt,
}: {
  title: string;
  note: string;
  scenarios: Scenario[];
  prompt: string;
}) {
  return (
    <Card className="mt-6">
      <CardHeader title={title} right={<span className="text-xs text-fg-faint">{note}</span>} />
      <div className="divide-y divide-edge">
        {scenarios.map((s) => (
          <div key={s.question} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div className="text-sm font-medium text-accent">“{s.question}”</div>
              <span
                className={`shrink-0 rounded-full border border-edge px-2 py-0.5 text-xs font-medium ${
                  s.confidence >= 0.8 ? "text-positive" : s.confidence >= 0.65 ? "text-caution" : "text-fg-muted"
                }`}
              >
                {Math.round(s.confidence * 100)}% confidence
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{s.answer}</p>
            <p className="mt-1.5 text-xs text-fg-faint">
              <span className="font-medium">Assumptions:</span> {s.assumptions}
            </p>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 border-t border-edge px-5 py-3">
        <input
          readOnly
          value={prompt}
          className="flex-1 rounded-md border border-edge bg-base px-3 py-2 text-sm text-fg-faint outline-none"
        />
        <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
          Simulate
        </button>
      </div>
    </Card>
  );
}
