import { marketplace } from "@/lib/data";
import { Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

const kinds = ["Supplier", "Manufacturer", "Equipment", "Professional"] as const;

export default function MarketplacePage() {
  return (
    <>
      <PageHeader
        title="Marketplace"
        subtitle="Verified suppliers, manufacturers, equipment, and professionals — matched to your projects."
        actions={
          <button className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-signal-600">
            Post requirement
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        {kinds.map((k) => {
          const n = marketplace.filter((m) => m.kind === k).length;
          return <Kpi key={k} label={`${k}s`} value={String(n)} sub="in your matched network" />;
        })}
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Network"
          right={<span className="text-xs text-ink-400">Ranked by performance history on platform projects</span>}
        />
        <Table headers={["Partner", "Type", "Capability", "Region", "Rating", "Capacity"]}>
          {marketplace.map((m) => (
            <tr key={m.name} className="transition hover:bg-ink-50">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2 font-medium text-ink-900">
                  {m.name}
                  {m.verified && (
                    <span className="rounded-full bg-green-50 px-2 py-0.5 text-[10px] font-medium text-positive" title="Verified partner">
                      Verified
                    </span>
                  )}
                </div>
              </td>
              <td className="px-5 py-4 text-ink-600">{m.kind}</td>
              <td className="px-5 py-4 text-ink-600">{m.category}</td>
              <td className="px-5 py-4 text-ink-600">{m.region}</td>
              <td className="px-5 py-4">
                <span className={`font-medium ${m.rating >= 4.5 ? "text-positive" : "text-ink-900"}`}>
                  {m.rating.toFixed(1)}
                </span>
                <span className="text-xs text-ink-400"> / 5</span>
              </td>
              <td className="px-5 py-4 text-ink-600">{m.capacity}</td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
