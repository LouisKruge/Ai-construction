import { fmt, pipeline } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

const stageBadge: Record<string, string> = {
  Qualifying: "Queued",
  Proposal: "In review",
  "Tender submitted": "Evaluating",
  Negotiation: "In production",
  Won: "Awarded",
  Lost: "Delayed",
};

export default function SalesPage() {
  const open = pipeline.filter((o) => o.stage !== "Won" && o.stage !== "Lost");
  const weighted = open.reduce((s, o) => s + o.value * o.winProbability, 0);
  return (
    <>
      <PageHeader
        title="Sales Studio"
        subtitle="Tender discovery, pipeline, and proposal intelligence."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            + New opportunity
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Open pipeline" value={fmt.zar(open.reduce((s, o) => s + o.value, 0))} sub={`${open.length} opportunities`} />
        <Kpi label="Weighted pipeline" value={fmt.zar(weighted)} sub="probability-adjusted" />
        <Kpi label="Win rate (12m)" value="34%" sub="by value · sector avg 22%" tone="positive" />
        <Kpi label="Tenders discovered (30d)" value="14" sub="6 matched our capability profile" />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Pipeline"
          right={<span className="text-xs text-fg-faint">Win probability estimated from bid history and competitor intelligence</span>}
        />
        <Table headers={["Opportunity", "Client", "Sector", "Value", "Win prob.", "Closes", "Stage"]}>
          {pipeline.map((o) => (
            <tr key={o.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="font-medium text-fg">{o.name}</div>
                <div className="mt-0.5 text-xs text-fg-faint">{o.id}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">{o.client}</td>
              <td className="px-5 py-4 text-fg-muted">{o.sector}</td>
              <td className="px-5 py-4 text-fg">{fmt.zar(o.value)}</td>
              <td className="px-5 py-4">
                <span
                  className={`font-medium ${
                    o.winProbability >= 0.6 ? "text-positive" : o.winProbability >= 0.35 ? "text-caution" : "text-fg-faint"
                  }`}
                >
                  {fmt.pct(o.winProbability)}
                </span>
              </td>
              <td className="px-5 py-4 text-fg-muted">{o.closes}</td>
              <td className="px-5 py-4">
                <Badge label={stageBadge[o.stage] ?? o.stage} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
