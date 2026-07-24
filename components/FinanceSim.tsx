"use client";

import { useState } from "react";
import { projectCash, rands } from "@/lib/engines";
import { Field, Metric, Toggle } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function FinanceSim() {
  const [inflow, setInflow] = useState(34);
  const [outflow, setOutflow] = useState(38);
  const [accelerate, setAccelerate] = useState(false);
  const [delayCapex, setDelayCapex] = useState(false);
  const [draw, setDraw] = useState(false);

  const floor = 180e6;
  const r = projectCash({
    startCash: 212e6,
    weeklyInflow: inflow * 1e6,
    weeklyOutflow: outflow * 1e6,
    accelerateReceivables: accelerate ? 41e6 : 0,
    delayCapex: delayCapex ? 12e6 : 0,
    drawFacility: draw ? 60e6 : 0,
    floor,
  });

  const max = Math.max(...r.weeks.map((w) => w.balance), 212e6);
  const min = Math.min(...r.weeks.map((w) => w.balance), floor);
  const range = max - min || 1;
  const H = 90;
  const pts = r.weeks
    .map((w, i) => `${(i / (r.weeks.length - 1)) * 100},${H - ((w.balance - min) / range) * H}`)
    .join(" ");
  const floorY = H - ((floor - min) / range) * H;

  return (
    <Card className="mt-6">
      <CardHeader
        title="Enterprise Financial Brain"
        right={<span className="text-xs text-fg-faint">13-week cash projection — recomputed as you pull each lever</span>}
      />
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Weekly inflow" value={inflow} min={10} max={80} step={1} unit="Rm" onChange={setInflow} />
          <Field label="Weekly outflow" value={outflow} min={10} max={80} step={1} unit="Rm" onChange={setOutflow} />
          <div className="grid gap-2">
            <Toggle label="Accelerate receivables (+R41m, wk 2)" on={accelerate} onChange={setAccelerate} />
            <Toggle label="Delay non-critical capex (+R12m)" on={delayCapex} onChange={setDelayCapex} />
            <Toggle label="Draw standby facility (+R60m, wk 1)" on={draw} onChange={setDraw} />
          </div>
        </div>
        <div className="self-start">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Min cash position" value={rands(r.minBalance)} sub={`week ${r.minWeek}`} tone={r.minBalance < floor ? "critical" : "positive"} />
            <Metric
              label="Shortfall vs floor"
              value={r.shortfallWeek ? `week ${r.shortfallWeek}` : "none"}
              sub={`floor ${rands(floor)}`}
              tone={r.shortfallWeek ? "critical" : "positive"}
            />
          </div>
          <div className="mt-3 rounded-lg border border-edge bg-base p-3">
            <svg viewBox={`0 0 100 ${H}`} preserveAspectRatio="none" className="h-24 w-full">
              <line x1="0" y1={floorY} x2="100" y2={floorY} stroke="var(--color-critical)" strokeWidth="0.5" strokeDasharray="2 2" />
              <polyline
                points={pts}
                fill="none"
                stroke={r.shortfallWeek ? "var(--color-critical)" : "var(--color-positive)"}
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-fg-faint">
              <span>now</span>
              <span className="text-critical">policy floor</span>
              <span>+13 wks</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-fg-muted">
            {r.shortfallWeek
              ? `Projected to breach the ${rands(floor)} floor in week ${r.shortfallWeek}. Toggle actions to close the gap.`
              : `Stays above the ${rands(floor)} floor across the window. End balance ${rands(r.endBalance)}.`}
          </div>
        </div>
      </div>
    </Card>
  );
}
