"use client";

import { useState } from "react";
import { procurementSavings, rands } from "@/lib/engines";
import { Field, Metric } from "@/components/controls";
import { Card, CardHeader } from "@/components/ui";

export default function ProcurementSim() {
  const [orderValue, setOrderValue] = useState(18.4);
  const [priceDelta, setPriceDelta] = useState(-6);
  const [delayDays, setDelayDays] = useState(10);
  const [orders, setOrders] = useState(4);
  const [inventory, setInventory] = useState(0);

  const r = procurementSavings({
    orderValue: orderValue * 1e6,
    priceDeltaPct: priceDelta,
    delayDays,
    orders,
    logisticsPerOrder: 80_000,
    inventoryOffsetPct: inventory,
    costOfCapitalPct: 11,
  });
  const worth = r.netSaving > 0;

  return (
    <Card className="mt-6">
      <CardHeader
        title="Market Intelligence & Negotiation Engine"
        right={<span className="text-xs text-fg-faint">Savings net of working-capital cost — computed live</span>}
      />
      <div className="grid gap-6 p-5 md:grid-cols-2">
        <div className="space-y-4">
          <Field label="Order value" value={orderValue} min={1} max={80} step={0.5} unit="Rm" onChange={setOrderValue} />
          <Field label="Price movement over window" value={priceDelta} min={-15} max={10} step={0.5} unit="%" onChange={setPriceDelta} />
          <Field label="Delay to capture price" value={delayDays} min={0} max={40} step={1} unit="days" onChange={setDelayDays} />
          <Field label="POs to consolidate" value={orders} min={1} max={10} step={1} onChange={setOrders} />
          <Field label="Already in inventory" value={inventory} min={0} max={60} step={5} unit="%" onChange={setInventory} />
        </div>
        <div className="self-start">
          <div className="grid grid-cols-2 gap-3">
            <Metric label="Price saving" value={rands(r.priceSaving)} sub={priceDelta < 0 ? "capture the drop" : "no drop to capture"} />
            <Metric label="Consolidation" value={rands(r.consolidationSaving)} sub={`${orders} POs → 1 shipment`} />
            <Metric label="Inventory offset" value={rands(r.inventorySaving)} />
            <Metric label="Carrying cost" value={rands(r.carryingCost)} sub={`${delayDays}d @ 11% p.a.`} tone="caution" />
          </div>
          <div className="mt-3 rounded-lg border border-edge bg-base p-3">
            <div className="flex items-baseline justify-between">
              <span className="text-[10px] font-medium uppercase tracking-widest text-fg-faint">Net saving</span>
              <span className="text-[10px] text-fg-faint">{(r.savingPct * 100).toFixed(1)}% of order</span>
            </div>
            <div className={`mt-1 text-2xl font-semibold tabular-nums ${worth ? "text-positive" : "text-critical"}`}>
              {rands(r.netSaving)}
            </div>
            <div className="mt-1 text-xs text-fg-muted">
              {worth
                ? "Recommendation: proceed — net positive after working-capital cost."
                : "Recommendation: hold — carrying cost outweighs the saving."}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
