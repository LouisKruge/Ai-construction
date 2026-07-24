import { benchmarks } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function AnalyticsPage() {
  return (
    <>
      <PageHeader
        title="Analytics & Benchmarks"
        subtitle="Your performance against anonymized industry benchmarks from the intelligence network."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Benchmark percentile" value="Top 8%" sub="overall delivery performance" tone="positive" />
        <Kpi label="Forecast accuracy" value="±3.8%" sub="cost at completion, 12m" tone="positive" />
        <Kpi label="Data contribution" value="Opt-in" sub="anonymized · improves your benchmarks" />
        <Kpi label="Insights generated (30d)" value="212" sub="61% actioned by teams" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="You vs industry"
          right={<span className="text-xs text-fg-faint">Anonymized network data · Southern Africa · rolling 12 months</span>}
        />
        <Table headers={["Metric", "Your portfolio", "Industry benchmark", "Position"]}>
          {benchmarks.map((b) => (
            <tr key={b.metric} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{b.metric}</td>
              <td className="px-5 py-4 font-medium text-fg">{b.company}</td>
              <td className="px-5 py-4 text-fg-muted">{b.industry}</td>
              <td className="px-5 py-4">
                <span className={`text-sm font-medium ${b.better ? "text-positive" : "text-critical"}`}>
                  {b.better ? "Ahead" : "Behind"}
                </span>
              </td>
            </tr>
          ))}
        </Table>
        <div className="border-t border-edge px-5 py-3 text-xs text-fg-faint">
          Benchmarks are computed from anonymized, permissioned data contributed by network
          participants. No customer-identifiable data is shared.
        </div>
      </Card>
    </>
  );
}
