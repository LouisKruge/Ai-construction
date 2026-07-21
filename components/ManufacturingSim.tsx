"use client";

import { useState } from "react";
import { simulateProduction, rands } from "@/lib/engines";
import { Field, Metric, Toggle } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function ManufacturingSim() {
  const [units, setUnits] = useState(112);
  const [cycleHrs, setCycleHrs] = useState(1.4);
  const [machines, setMachines] = useState(2);
  const [twoShift, setTwoShift] = useState(false);

  const base = { units, cycleHrs, machines, shiftPremiumPct: 35, labourRate: 850, logisticsPerUnit: 1200 };
  const single = simulateProduction({ ...base, shifts: 1 });
  const chosen = simulateProduction({ ...base, shifts: twoShift ? 2 : 1 });
  const dayDelta = single.durationDays - chosen.durationDays;
  const costDelta = chosen.totalCost - single.totalCost;

  return (
    <Card className="mt-6">
      <CardHeader
        title="Manufacturing Simulation Engine"
        right={<span className="text-xs text-fg-faint">Real production math — duration, cost, delivery recompute live</span>}
      />
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Units to produce" value={units} min={10} max={500} step={2} onChange={setUnits} />
          <Field label="Cycle time" value={cycleHrs} min={0.2} max={6} step={0.1} unit="hr/unit" onChange={setCycleHrs} />
          <Field label="Machines" value={machines} min={1} max={8} step={1} onChange={setMachines} />
          <Toggle label="Add a second shift (+35% premium)" on={twoShift} onChange={setTwoShift} />
          <p className="text-xs leading-relaxed text-fg-faint">
            {twoShift ? (
              <>
                Second shift pulls delivery forward <span className="font-medium text-positive">{dayDelta} working days</span> for{" "}
                <span className="font-medium text-caution">{rands(costDelta)}</span> more labour. Recommended only if the
                downstream erection sequence can absorb the earlier steel.
              </>
            ) : (
              <>Single shift. Toggle a second shift to see the schedule-vs-cost trade-off computed live.</>
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 self-start">
          <Metric label="Duration" value={`${chosen.durationDays} days`} sub={`${chosen.dailyHours} machine-hrs/day`} tone={twoShift ? "positive" : "neutral"} />
          <Metric label="Delivery date" value={chosen.deliveryDate} sub="5-day working week" />
          <Metric label="Throughput" value={`${chosen.throughputPerDay.toFixed(1)}/day`} sub={`${chosen.totalHours.toFixed(0)} total hrs`} />
          <Metric label="Utilisation" value={`${Math.round(chosen.utilisation * 100)}%`} tone="neutral" />
          <Metric label="Labour cost" value={rands(chosen.labourCost)} />
          <Metric label="Total cost" value={rands(chosen.totalCost)} sub={`incl. ${rands(chosen.logistics)} logistics`} tone="accent" />
        </div>
      </div>
    </Card>
  );
}
