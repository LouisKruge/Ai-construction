import Link from "next/link";
import { clashSets, designPackages, projects } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Progress, Table } from "@/components/ui";

export default function DesignPage() {
  const openClashes = clashSets.reduce((s, c) => s + (c.clashes - c.resolved), 0);
  return (
    <>
      <PageHeader
        title="Design & Architecture Studio"
        subtitle="Design packages, BIM coordination, and clash detection across every discipline."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            Upload model
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Active packages" value={String(designPackages.length)} sub="across 4 projects" />
        <Kpi label="Drawings approved" value={`${designPackages.reduce((s, d) => s + d.approved, 0)} / ${designPackages.reduce((s, d) => s + d.drawings, 0)}`} sub="all packages" />
        <Kpi label="Open clashes" value={String(openClashes)} sub="4 clash sets" tone={openClashes > 0 ? "caution" : "positive"} />
        <Kpi label="Awaiting client review" value="1" sub="Logistics park — warehouse shells" tone="caution" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Design packages" right={<span className="text-xs text-fg-faint">Approval progress per package</span>} />
        <Table headers={["Package", "Project", "Architect", "Stage", "Approved", "Status"]}>
          {designPackages.map((d) => (
            <tr key={d.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="font-medium text-fg">{d.name}</div>
                <div className="mt-0.5 text-xs text-fg-faint">{d.id}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">
                <Link href={`/projects/${d.project}`} className="hover:text-accent">
                  {projects.find((p) => p.id === d.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-fg-muted">{d.architect}</td>
              <td className="px-5 py-4 text-fg-muted">{d.stage}</td>
              <td className="px-5 py-4">
                <div className="flex w-36 items-center gap-2">
                  <Progress value={(d.approved / d.drawings) * 100} />
                  <span className="whitespace-nowrap text-xs text-fg-faint">
                    {d.approved}/{d.drawings}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <Badge label={d.status === "Approved" ? "Passed" : d.status === "Client review" ? "In review" : d.status === "On hold" ? "Queued" : "In production"} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Clash detection" right={<span className="text-xs text-fg-faint">Automated model coordination — resolved / total</span>} />
        <Table headers={["Clash set", "Project", "Zone", "Resolution", "Status"]}>
          {clashSets.map((c) => (
            <tr key={c.id} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="font-medium text-fg">{c.disciplines}</div>
                <div className="mt-0.5 text-xs text-fg-faint">{c.id}</div>
              </td>
              <td className="px-5 py-4 text-fg-muted">
                <Link href={`/projects/${c.project}`} className="hover:text-accent">
                  {projects.find((p) => p.id === c.project)?.name}
                </Link>
              </td>
              <td className="px-5 py-4 text-fg-muted">{c.zone}</td>
              <td className="px-5 py-4">
                <div className="flex w-36 items-center gap-2">
                  <Progress value={(c.resolved / c.clashes) * 100} tone={c.status === "Open" ? "caution" : "neutral"} />
                  <span className="whitespace-nowrap text-xs text-fg-faint">
                    {c.resolved}/{c.clashes}
                  </span>
                </div>
              </td>
              <td className="px-5 py-4">
                <Badge label={c.status === "Resolved" ? "Passed" : c.status} />
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
