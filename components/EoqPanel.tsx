"use client";

import { useState } from "react";
import { eoq, rands } from "@/lib/engines";
import { Field, Metric } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function EoqPanel() {
  const [demand, setDemand] = useState(24000);
  const [ordering, setOrdering] = useState(4500);
  const [holding, setHolding] = useState(180);
  const [lead, setLead] = useState(21);
  const [service, setService] = useState(95);

  const z = service >= 99 ? 2.33 : service >= 97 ? 1.88 : service >= 95 ? 1.65 : service >= 90 ? 1.28 : 1.04;
  const r = eoq({
    annualDemand: demand,
    orderingCost: ordering,
    holdingCost: holding,
    leadDays: lead,
    serviceZ: z,
    demandStd: (demand / 365) * 0.45, // assume 45% daily demand variability
  });

  return (
    <Card className="mt-6">
      <CardHeader
        title="Material planning — economic order quantity"
        right={<span className="text-xs text-fg-faint">Wilson EOQ · reorder point · safety stock</span>}
      />
      <div className="grid gap-6 p-5 lg:grid-cols-[280px_1fr]">
        <div className="space-y-3.5">
          <Field label="Annual demand" value={demand} min={2000} max={120000} step={1000} unit="units" onChange={setDemand} />
          <Field label="Ordering cost" value={ordering} min={500} max={15000} step={500} unit="R/order" onChange={setOrdering} />
          <Field label="Holding cost" value={holding} min={20} max={600} step={10} unit="R/unit/yr" onChange={setHolding} />
          <Field label="Lead time" value={lead} min={3} max={90} step={1} unit="days" onChange={setLead} />
          <Field label="Service level" value={service} min={85} max={99} step={1} unit="%" onChange={setService} />
        </div>
        <div className="self-start">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Metric label="EOQ" value={`${Math.round(r.eoq).toLocaleString("en-ZA")}`} sub="units/order" tone="accent" />
            <Metric label="Orders / year" value={r.ordersPerYear.toFixed(1)} sub={`cycle ${r.cycleDays.toFixed(0)} days`} />
            <Metric label="Reorder point" value={Math.round(r.reorderPoint).toLocaleString("en-ZA")} sub={`safety ${Math.round(r.safetyStock)}`} />
            <Metric label="Ordering cost/yr" value={rands(r.annualOrderingCost)} />
            <Metric label="Holding cost/yr" value={rands(r.annualHoldingCost)} />
            <Metric label="Total annual cost" value={rands(r.totalAnnualCost)} tone="neutral" />
          </div>
          <p className="mt-3 text-[11px] text-fg-faint">
            EOQ = √(2·D·S/H); reorder point = daily demand × lead time + z·σ·√(lead). Ordering and holding costs are balanced at the EOQ — the classic inventory trade-off. z from the service level (95% → 1.65).
          </p>
        </div>
      </div>
    </Card>
  );
}
