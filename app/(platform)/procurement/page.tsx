import { fmt, projects, rfqs, suppliers } from "@/lib/data";
import { Badge, Card, CardHeader, Table } from "@/components/ui";
import ProcurementSim from "@/components/ProcurementSim";
import BidAdjudication from "@/components/BidAdjudication";
import EoqPanel from "@/components/EoqPanel";
import StudioHero from "@/components/StudioHero";

export default function ProcurementPage() {
  const spendYtd = suppliers.reduce((s, x) => s + x.spendYtd, 0);
  return (
    <>
      <StudioHero
        title="Procurement Studio"
        subtitle="A live sourcing desk — RFQs, supplier intelligence, and benchmark-driven awards adjudicated on price, quality, and delivery."
        motif="procurement"
        status="Live · 5 key suppliers"
        kpis={[
          { label: "Open RFQs", value: "2" },
          { label: "Spend YTD", value: fmt.zar(spendYtd) },
          { label: "Benchmark savings", value: "R6.1m", tone: "positive" },
          { label: "Deliveries at risk", value: "1", tone: "caution" },
        ]}
        actions={
          <button className="rounded-md bg-gradient-to-r from-accent to-accent-2 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-accent/25 transition hover:brightness-110">
            + New RFQ
          </button>
        }
      />

      <Card className="mt-6">
        <CardHeader title="Requests for quotation" right={<span className="text-xs text-fg-faint">Lowest quote vs platform benchmark</span>} />
        <Table headers={["Package", "Project", "Quotes", "Lowest", "Benchmark", "Closes", "Status"]}>
          {rfqs.map((r) => {
            const overBenchmark = r.lowest > 0 && r.lowest > r.benchmark;
            return (
              <tr key={r.id} className="transition hover:bg-raise">
                <td className="px-5 py-4">
                  <div className="font-medium text-fg">{r.package}</div>
                  <div className="mt-0.5 text-xs text-fg-faint">{r.id}</div>
                </td>
                <td className="px-5 py-4 text-fg-muted">
                  {projects.find((p) => p.id === r.project)?.name}
                </td>
                <td className="px-5 py-4 text-fg-muted">{r.quotes}</td>
                <td className={`px-5 py-4 font-medium ${overBenchmark ? "text-critical" : "text-fg"}`}>
                  {r.lowest ? fmt.zar(r.lowest) : "—"}
                </td>
                <td className="px-5 py-4 text-fg-faint">{fmt.zar(r.benchmark)}</td>
                <td className="px-5 py-4 text-fg-muted">{r.closes}</td>
                <td className="px-5 py-4">
                  <Badge label={r.status} />
                </td>
              </tr>
            );
          })}
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Supplier performance" right={<span className="text-xs text-fg-faint">Scored from delivery and quality history</span>} />
        <Table headers={["Supplier", "Category", "On-time", "Quality", "Active orders", "Spend YTD"]}>
          {suppliers.map((s) => (
            <tr key={s.name} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{s.name}</td>
              <td className="px-5 py-4 text-fg-muted">{s.category}</td>
              <td className="px-5 py-4">
                <span
                  className={`font-medium ${
                    s.onTimeRate >= 0.9 ? "text-positive" : s.onTimeRate >= 0.8 ? "text-caution" : "text-critical"
                  }`}
                >
                  {fmt.pct(s.onTimeRate)}
                </span>
              </td>
              <td className="px-5 py-4 text-fg-muted">{s.qualityScore.toFixed(1)} / 5</td>
              <td className="px-5 py-4 text-fg-muted">{s.activeOrders}</td>
              <td className="px-5 py-4 text-fg">{fmt.zar(s.spendYtd)}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <BidAdjudication />

      <EoqPanel />

      <ProcurementSim />
    </>
  );
}
