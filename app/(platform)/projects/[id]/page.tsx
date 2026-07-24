import Link from "next/link";
import { notFound } from "next/navigation";
import {
  clashSets,
  defects,
  documents,
  engReviews,
  fmt,
  inspections,
  insights,
  projects,
  rfis,
  rfqs,
  safetyItems,
  schedule,
  sensors,
  twinCaptures,
  variations,
  workOrders,
} from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, Progress, Table } from "@/components/ui";

export function generateStaticParams() {
  return projects.map((p) => ({ id: p.id }));
}

const sections = [
  ["overview", "Overview"],
  ["programme", "Programme"],
  ["engineering", "Engineering"],
  ["procurement", "Procurement"],
  ["quality", "Quality"],
  ["safety", "Safety"],
  ["finance", "Finance"],
  ["documents", "Documents"],
  ["twin", "Digital twin"],
] as const;

export default async function ProjectDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = projects.find((x) => x.id === id);
  if (!p) notFound();

  const byProject = <T extends { project: string }>(rows: T[]) =>
    rows.filter((r) => r.project === p.id);

  const pInsights = byProject(insights);
  const pSchedule = byProject(schedule);
  const pReviews = byProject(engReviews);
  const pClashes = byProject(clashSets);
  const pRfis = byProject(rfis);
  const pRfqs = byProject(rfqs);
  const pOrders = byProject(workOrders);
  const pDefects = byProject(defects);
  const pInspections = byProject(inspections);
  const pSafety = byProject(safetyItems);
  const pVariations = byProject(variations);
  const pDocs = byProject(documents);
  const pSensors = byProject(sensors);
  const pCaptures = byProject(twinCaptures);

  const behind = p.plannedProgress - p.progress;
  const approvedVOs = pVariations
    .filter((v) => v.status === "Approved")
    .reduce((s, v) => s + v.value, 0);

  const severityTone = {
    critical: "border-l-critical",
    caution: "border-l-caution",
    info: "border-l-accent",
  } as const;

  const Empty = ({ label }: { label: string }) => (
    <div className="px-5 py-6 text-sm text-fg-faint">{label}</div>
  );

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <Link href="/projects" className="text-xs font-medium text-accent hover:underline">
          ← All projects
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-fg">{p.name}</h1>
          <Badge label={p.status} />
        </div>
        <p className="mt-1 text-sm text-fg-faint">
          {p.id} · {p.client} · {p.location} · {p.sector} · Phase: {p.phase} · {p.startDate} →{" "}
          {p.endDate}
        </p>
      </div>

      {/* Section nav */}
      <nav className="sticky top-14 z-20 -mx-2 mb-8 flex gap-1 overflow-x-auto rounded-lg border border-edge bg-surface/95 p-1 text-sm backdrop-blur">
        {sections.map(([anchor, label]) => (
          <a
            key={anchor}
            href={`#${anchor}`}
            className="whitespace-nowrap rounded-md px-3 py-1.5 text-fg-faint transition hover:bg-raise hover:text-fg"
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Overview */}
      <section id="overview" className="scroll-mt-32">
        <div className="grid gap-4 md:grid-cols-4">
          <Kpi label="Budget" value={fmt.zar(p.budget)} sub={`Committed ${fmt.zar(p.committed)}`} />
          <Kpi label="Spent to date" value={fmt.zar(p.spent)} sub={`${Math.round((p.spent / p.budget) * 100)}% of budget`} />
          <Kpi
            label="Progress"
            value={`${p.progress}%`}
            sub={`Planned ${p.plannedProgress}% · ${behind > 0 ? `${behind} pts behind` : "on plan"}`}
            tone={behind > 5 ? "critical" : behind > 2 ? "caution" : "positive"}
          />
          <Kpi
            label="Risk score"
            value={String(p.riskScore)}
            sub={`${p.openRfis} open RFIs · ${p.openDefects} open defects`}
            tone={p.riskScore >= 60 ? "critical" : p.riskScore >= 40 ? "caution" : "positive"}
          />
        </div>

        {pInsights.length > 0 && (
          <Card className="mt-6">
            <CardHeader title="Agent insights on this project" />
            <div className="divide-y divide-edge">
              {pInsights.map((i) => (
                <div key={i.id} className={`border-l-2 px-5 py-4 ${severityTone[i.severity]}`}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-sm font-medium text-fg">{i.title}</div>
                    <span className="whitespace-nowrap text-xs text-fg-faint">
                      {i.agent} · {Math.round(i.confidence * 100)}% conf.
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-fg-muted">{i.detail}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium text-accent">Recommended: </span>
                    <span className="text-fg-muted">{i.action}</span>
                  </p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </section>

      {/* Programme */}
      <section id="programme" className="mt-10 scroll-mt-32">
        <Card>
          <CardHeader title="Programme" right={<span className="text-xs text-fg-faint">Critical path highlighted</span>} />
          {pSchedule.length === 0 ? (
            <Empty label="No programme activities yet — generated once the project enters delivery." />
          ) : (
            <Table headers={["Activity", "Window", "Float", "Progress"]}>
              {pSchedule.map((s) => (
                <tr key={s.activity} className="transition hover:bg-raise">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {s.critical && <span className="h-2 w-2 rounded-full bg-critical" title="Critical path" />}
                      <span className="font-medium text-fg">{s.activity}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-fg-muted">{s.start} → {s.end}</td>
                  <td className="px-5 py-4">
                    <span className={s.float === 0 ? "font-medium text-critical" : "text-fg-muted"}>{s.float} d</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex w-40 items-center gap-2">
                      <Progress value={s.progress} />
                      <span className="text-xs text-fg-faint">{s.progress}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </section>

      {/* Engineering */}
      <section id="engineering" className="mt-10 scroll-mt-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Drawing reviews" />
            {pReviews.length === 0 ? (
              <Empty label="No drawings in review." />
            ) : (
              <Table headers={["Drawing", "Rev", "Findings", "Status"]}>
                {pReviews.map((r) => (
                  <tr key={r.id} className="transition hover:bg-raise">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-fg">{r.drawing}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{r.discipline} · {r.reviewer}</div>
                    </td>
                    <td className="px-5 py-3.5 text-fg-muted">{r.revision}</td>
                    <td className="px-5 py-3.5">
                      <span className={r.findings > 0 ? "font-medium text-critical" : "text-fg-faint"}>{r.findings}</span>
                    </td>
                    <td className="px-5 py-3.5"><Badge label={r.status} /></td>
                  </tr>
                ))}
              </Table>
            )}
          </Card>
          <Card className="self-start">
            <CardHeader title="Clash detection & RFIs" />
            {pClashes.length === 0 && pRfis.length === 0 ? (
              <Empty label="No clash sets or RFIs." />
            ) : (
              <div className="divide-y divide-edge">
                {pClashes.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-fg">{c.disciplines}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{c.zone} · {c.resolved}/{c.clashes} resolved</div>
                    </div>
                    <Badge label={c.status} />
                  </div>
                ))}
                {pRfis.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-fg">{r.subject}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{r.id} · with {r.ballInCourt} · due {r.due}</div>
                    </div>
                    <Badge label={r.status === "Answered" ? "Passed" : r.status === "Overdue" ? "Delayed" : "Open"} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Procurement */}
      <section id="procurement" className="mt-10 scroll-mt-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="RFQs" />
            {pRfqs.length === 0 ? (
              <Empty label="No open RFQs." />
            ) : (
              <div className="divide-y divide-edge">
                {pRfqs.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-fg">{r.package}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">
                        {r.quotes} quotes · lowest {r.lowest ? fmt.zar(r.lowest) : "—"} · benchmark {fmt.zar(r.benchmark)}
                      </div>
                    </div>
                    <Badge label={r.status} />
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="self-start">
            <CardHeader title="Manufacturing orders" />
            {pOrders.length === 0 ? (
              <Empty label="No manufacturing work orders." />
            ) : (
              <div className="divide-y divide-edge">
                {pOrders.map((w) => (
                  <div key={w.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-fg">{w.item}</div>
                      <Badge label={w.status} />
                    </div>
                    <div className="mt-1 text-xs text-fg-faint">{w.factory} · {w.qty} · due {w.due}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <Progress value={w.progress} />
                      <span className="text-xs text-fg-faint">{w.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Quality */}
      <section id="quality" className="mt-10 scroll-mt-32">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Defects" />
            {pDefects.length === 0 ? (
              <Empty label="No open defects." />
            ) : (
              <div className="divide-y divide-edge">
                {pDefects.map((d) => (
                  <div key={d.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-medium text-fg">{d.description}</div>
                      <span
                        className={`whitespace-nowrap text-xs font-medium ${
                          d.severity === "Critical" ? "text-critical" : d.severity === "Major" ? "text-caution" : "text-fg-faint"
                        }`}
                      >
                        {d.severity}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-fg-faint">
                      {d.id} · {d.location} · {d.trade} · {d.status} · due {d.due}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="self-start">
            <CardHeader title="Inspections" />
            {pInspections.length === 0 ? (
              <Empty label="No inspections recorded." />
            ) : (
              <div className="divide-y divide-edge">
                {pInspections.map((i) => (
                  <div key={i.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-fg">{i.type}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{i.date} · {i.inspector} · {i.notes}</div>
                    </div>
                    <Badge label={i.result === "Failed" ? "Issues found" : i.result === "Scheduled" ? "Queued" : i.result} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" className="mt-10 scroll-mt-32">
        <Card>
          <CardHeader title="Safety log" />
          {pSafety.length === 0 ? (
            <Empty label="No safety records." />
          ) : (
            <Table headers={["Type", "Description", "Date", "Status"]}>
              {pSafety.map((s) => (
                <tr key={s.id} className="transition hover:bg-raise">
                  <td className="px-5 py-3.5 font-medium text-fg">{s.type}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{s.description}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{s.date}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={s.status === "Active" ? "In production" : s.status === "Closed" ? "Passed" : "Open"} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </section>

      {/* Finance */}
      <section id="finance" className="mt-10 scroll-mt-32">
        <div className="grid gap-4 md:grid-cols-3">
          <Kpi label="Approved variations" value={fmt.zar(approvedVOs)} sub={`${pVariations.length} total variation orders`} />
          <Kpi label="Committed" value={fmt.zar(p.committed)} sub={`${Math.round((p.committed / p.budget) * 100)}% of budget`} />
          <Kpi label="Remaining budget" value={fmt.zar(p.budget - p.spent)} sub="uncommitted + committed-unspent" />
        </div>
        <Card className="mt-4">
          <CardHeader title="Variation orders" />
          {pVariations.length === 0 ? (
            <Empty label="No variation orders." />
          ) : (
            <Table headers={["VO", "Description", "Value", "Status"]}>
              {pVariations.map((v) => (
                <tr key={v.id} className="transition hover:bg-raise">
                  <td className="px-5 py-3.5 font-mono text-xs text-fg-faint">{v.id}</td>
                  <td className="px-5 py-3.5 font-medium text-fg">{v.description}</td>
                  <td className="px-5 py-3.5 text-fg">{fmt.zar(v.value)}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={v.status === "Approved" ? "Awarded" : v.status === "Submitted" ? "Evaluating" : v.status} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </section>

      {/* Documents */}
      <section id="documents" className="mt-10 scroll-mt-32">
        <Card>
          <CardHeader title="Documents" right={<span className="text-xs text-fg-faint">Indexed documents are searchable by every agent</span>} />
          {pDocs.length === 0 ? (
            <Empty label="No documents uploaded." />
          ) : (
            <Table headers={["Document", "Type", "Version", "Size", "Uploaded", "AI index"]}>
              {pDocs.map((d) => (
                <tr key={d.id} className="transition hover:bg-raise">
                  <td className="px-5 py-3.5 font-medium text-fg">{d.name}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{d.type}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{d.version}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{d.size}</td>
                  <td className="px-5 py-3.5 text-fg-muted">{d.uploaded}</td>
                  <td className="px-5 py-3.5">
                    <Badge label={d.indexed === "Indexed" ? "Passed" : d.indexed === "Processing" ? "In review" : "Queued"} />
                  </td>
                </tr>
              ))}
            </Table>
          )}
        </Card>
      </section>

      {/* Digital twin */}
      <section id="twin" className="mt-10 scroll-mt-32 pb-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader title="Live sensors" />
            {pSensors.length === 0 ? (
              <Empty label="No sensors connected." />
            ) : (
              <div className="divide-y divide-edge">
                {pSensors.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3.5">
                    <div>
                      <div className="text-sm font-medium text-fg">{s.type}</div>
                      <div className="mt-0.5 text-xs text-fg-faint">{s.location} · {s.updated}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-fg">{s.value}</div>
                      <div
                        className={`text-xs font-medium ${
                          s.status === "Alert" ? "text-critical" : s.status === "Warning" ? "text-caution" : s.status === "Offline" ? "text-fg-faint" : "text-positive"
                        }`}
                      >
                        {s.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
          <Card className="self-start">
            <CardHeader title="Reality capture" />
            {pCaptures.length === 0 ? (
              <Empty label="No captures yet." />
            ) : (
              <div className="divide-y divide-edge">
                {pCaptures.map((c) => (
                  <div key={c.kind} className="px-5 py-3.5">
                    <div className="text-sm font-medium text-fg">{c.kind}</div>
                    <div className="mt-0.5 text-xs text-fg-faint">{c.date} · coverage {c.coverage}</div>
                    <div className="mt-1 text-sm text-fg-muted">{c.delta}</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </>
  );
}
