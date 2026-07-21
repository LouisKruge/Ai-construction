import { cashflow, fmt, projects } from "@/lib/data";
import { financeBrain } from "@/lib/workforce";
import { Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";
import ScenarioEngine from "@/components/ScenarioEngine";

export default function FinancePage() {
  const maxFlow = Math.max(...cashflow.flatMap((m) => [m.inflow, m.outflow]));
  return (
    <>
      <PageHeader
        title="Finance Studio"
        subtitle="Cashflow, margins, and valuations from the same data the site runs on."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Net cash position" value="R212m" sub="group, month-end" />
        <Kpi label="6-month net flow" value="+R51m" sub="projected" tone="positive" />
        <Kpi label="Certificates pending" value="R94m" sub="3 valuations awaiting sign-off" tone="caution" />
        <Kpi label="Cash cover" value="1.7×" sub="policy floor 1.6× · Oct at risk" tone="caution" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Cashflow forecast" right={<span className="text-xs text-fg-faint">ZAR millions · next 6 months</span>} />
          <div className="flex items-end gap-4 px-6 pb-4 pt-6" style={{ height: 220 }}>
            {cashflow.map((m) => (
              <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                <div className="flex w-full flex-1 items-end justify-center gap-1.5">
                  <div
                    className="w-4 rounded-t bg-accent"
                    style={{ height: `${(m.inflow / maxFlow) * 100}%` }}
                    title={`Inflow R${m.inflow}m`}
                  />
                  <div
                    className="w-4 rounded-t bg-fg-faint"
                    style={{ height: `${(m.outflow / maxFlow) * 100}%` }}
                    title={`Outflow R${m.outflow}m`}
                  />
                </div>
                <div className="text-xs text-fg-faint">{m.month}</div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5 border-t border-edge px-6 py-3 text-xs text-fg-faint">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-accent" /> Inflow
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-fg-faint" /> Outflow
            </span>
            <span className="ml-auto">September–October shortfall flagged by Cashflow Forecaster</span>
          </div>
        </Card>

        <Card className="self-start">
          <CardHeader title="Margin by project" right={<span className="text-xs text-fg-faint">Forecast at completion</span>} />
          <Table headers={["Project", "Budget", "Forecast margin"]}>
            {projects
              .filter((p) => p.status !== "Tender")
              .map((p, idx) => {
                const margins = [8.4, 12.6, 13.1, 6.2, 11.8];
                const m = margins[idx] ?? 10;
                return (
                  <tr key={p.id} className="transition hover:bg-raise">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-fg">{p.name}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{p.id}</div>
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">{fmt.zar(p.budget)}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`font-medium ${
                          m < 8 ? "text-critical" : m < 10 ? "text-caution" : "text-positive"
                        }`}
                      >
                        {m.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
          </Table>
        </Card>
      </div>

      <ScenarioEngine
        title="Enterprise Financial Brain"
        note="Not what happened — what to do next. Every recommendation carries impact, confidence, and assumptions"
        scenarios={financeBrain}
        prompt="If we accelerate three receivables and delay non-critical capex, what is the 90-day cash effect?"
      />
    </>
  );
}
