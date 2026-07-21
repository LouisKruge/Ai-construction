import Link from "next/link";
import { clashSets, designPackages, projects } from "@/lib/data";
import { drawingJobs } from "@/lib/workforce";
import { Badge, Card, CardHeader, Kpi, PageHeader, Progress, Table } from "@/components/ui";
import DrawingPreview from "@/components/DrawingPreview";
import DrawingGenerator from "@/components/DrawingGenerator";

const drawingStatusTone: Record<string, string> = {
  "Approved & issued": "text-positive",
  "Generated — awaiting engineer review": "text-caution",
  "Revisions requested": "text-critical",
  Generating: "text-info",
};

export default function DesignPage() {
  const openClashes = clashSets.reduce((s, c) => s + (c.clashes - c.resolved), 0);
  const awaitingReview = drawingJobs.filter((d) =>
    d.status.startsWith("Generated"),
  ).length;
  return (
    <>
      <PageHeader
        title="Design & Architecture Studio"
        subtitle="Generative design across every discipline — floor plans, structural, mechanical, electrical — reviewed by a licensed engineer before issue."
        actions={
          <div className="flex gap-2">
            <button className="rounded-md border border-edge px-4 py-2 text-sm font-medium text-fg-muted transition hover:border-edge-strong hover:text-fg">
              Upload model
            </button>
            <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
              + Generate drawing
            </button>
          </div>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Drawings generated (30d)" value="214" sub="across 6 disciplines" />
        <Kpi label="Awaiting engineer review" value={String(awaitingReview)} sub="never issued without sign-off" tone="caution" />
        <Kpi label="Open clashes" value={String(openClashes)} sub="4 clash sets" tone={openClashes > 0 ? "caution" : "positive"} />
        <Kpi label="Active packages" value={String(designPackages.length)} sub="across 4 projects" />
      </div>

      {/* Live parametric generator */}
      <div className="mt-6">
        <DrawingGenerator />
      </div>

      {/* Generative drawing queue */}
      <Card className="mt-6">
        <CardHeader
          title="AI drawing generation"
          right={<span className="text-xs text-fg-faint">Each drawing carries a confidence score and requires engineer sign-off before issue</span>}
        />
        <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-3">
          {drawingJobs.map((job) => (
            <div key={job.id} className="rounded-lg border border-edge bg-surface p-3">
              {job.status === "Generating" ? (
                <div className="flex aspect-[3/2] w-full items-center justify-center rounded-md border border-dashed border-edge-strong bg-base">
                  <span className="animate-pulse text-xs text-info">Generating…</span>
                </div>
              ) : (
                <DrawingPreview type={job.type} />
              )}
              <div className="mt-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium text-fg">{job.title}</span>
                  {job.confidence > 0 && (
                    <span className="whitespace-nowrap text-xs text-fg-faint">
                      {Math.round(job.confidence * 100)}%
                    </span>
                  )}
                </div>
                <div className="mt-0.5 text-xs text-fg-faint">
                  {job.type} · {job.agent} ·{" "}
                  <Link href={`/projects/${job.project}`} className="hover:text-accent">
                    {projects.find((p) => p.id === job.project)?.name}
                  </Link>
                </div>
                <div className={`mt-2 flex items-center gap-1.5 text-xs font-medium ${drawingStatusTone[job.status]}`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {job.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

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
