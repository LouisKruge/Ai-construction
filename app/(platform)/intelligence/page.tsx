import { assets, fmt, sectors } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader, Progress, Table } from "@/components/ui";

export default function IntelligencePage() {
  const underMgmt = sectors.reduce((s, x) => s + x.activeValue, 0);
  const liveAssets = sectors.reduce((s, x) => s + x.assets, 0);
  const due = sectors.reduce((s, x) => s + x.maintenanceDue, 0);

  return (
    <>
      <PageHeader
        title="Infrastructure Intelligence"
        subtitle="Lifecycle view of every sector and operating asset — from delivery through decades of operation."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Value under management" value={fmt.zar(underMgmt)} sub="active + operating portfolio" />
        <Kpi label="Operating assets" value={String(liveAssets)} sub="with live digital twins" />
        <Kpi label="Maintenance due (60d)" value={String(due)} sub="predictive + scheduled" tone={due > 0 ? "caution" : "positive"} />
        <Kpi label="Avg. asset condition" value="86" sub="condition index, weighted" tone="positive" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Sectors" right={<span className="text-xs text-fg-faint">Condition index from sensor data, inspections, and maintenance history</span>} />
        <Table headers={["Sector", "Active value", "Assets", "Condition", "Maint. due", "Trend"]}>
          {sectors.map((s) => (
            <tr key={s.sector} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{s.sector}</td>
              <td className="px-5 py-4 text-fg">{fmt.zar(s.activeValue)}</td>
              <td className="px-5 py-4 text-fg-muted">{s.assets || "—"}</td>
              <td className="px-5 py-4">
                {s.conditionScore > 0 ? (
                  <div className="flex w-32 items-center gap-2">
                    <Progress value={s.conditionScore} tone={s.conditionScore < 80 ? "caution" : "neutral"} />
                    <span className="text-xs text-fg-faint">{s.conditionScore}</span>
                  </div>
                ) : (
                  <span className="text-fg-faint">—</span>
                )}
              </td>
              <td className="px-5 py-4">
                <span className={s.maintenanceDue > 3 ? "font-medium text-caution" : "text-fg-muted"}>
                  {s.assets ? s.maintenanceDue : "—"}
                </span>
              </td>
              <td className="px-5 py-4">
                <span className={s.trend === "Growing" ? "text-positive" : s.trend === "Contracting" ? "text-critical" : "text-fg-muted"}>
                  {s.trend}
                </span>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Operating assets" right={<span className="text-xs text-fg-faint">Twins remain live after handover — maintenance is predicted, not reactive</span>} />
        <Table headers={["Asset", "Sector", "Commissioned", "Condition", "Next maintenance", "Open WOs", "Energy"]}>
          {assets.map((a) => (
            <tr key={a.name} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{a.name}</td>
              <td className="px-5 py-4 text-fg-muted">{a.sector}</td>
              <td className="px-5 py-4 text-fg-muted">{a.commissioned}</td>
              <td className="px-5 py-4">
                <span className={`font-medium ${a.condition >= 85 ? "text-positive" : a.condition >= 75 ? "text-caution" : "text-critical"}`}>
                  {a.condition}
                </span>
              </td>
              <td className="px-5 py-4 text-fg-muted">{a.nextMaintenance}</td>
              <td className="px-5 py-4 text-fg-muted">{a.openWorkOrders}</td>
              <td className="px-5 py-4 text-fg-muted">{a.energyTrend}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
