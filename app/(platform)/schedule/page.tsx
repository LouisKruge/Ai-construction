import { projects, schedule } from "@/lib/data";
import { Card, CardHeader, Progress, Table } from "@/components/ui";
import CriticalPath from "@/components/CriticalPath";
import EvmPanel from "@/components/EvmPanel";
import StudioHero from "@/components/StudioHero";

export default function SchedulePage() {
  const critical = schedule.filter((s) => s.critical);
  return (
    <>
      <StudioHero
        title="Schedule"
        subtitle="Master programme across the portfolio — critical-path activities, float, and earned-value controls in one place."
        motif="construction"
        status="Live · portfolio"
        kpis={[
          { label: "Critical activities", value: String(critical.length), tone: "caution" },
          { label: "Activities tracked", value: String(schedule.length) },
          { label: "Schedule variance", value: "−4.2 d", tone: "caution" },
          { label: "On programme", value: `${schedule.filter((s) => s.float > 0).length}` },
        ]}
      />

      <div className="mt-6">
        <CriticalPath />
      </div>

      <div className="mt-6">
        <EvmPanel />
      </div>

      <Card className="mt-6">
        <CardHeader title="Programme — key activities" right={<span className="text-xs text-fg-faint">Critical path highlighted</span>} />
        <Table headers={["Activity", "Project", "Window", "Float", "Progress"]}>
          {schedule.map((s) => (
            <tr key={s.activity} className="transition hover:bg-raise">
              <td className="px-5 py-4">
                <div className="flex items-center gap-2">
                  {s.critical && <span className="h-2 w-2 rounded-full bg-critical" title="Critical path" />}
                  <span className="font-medium text-fg">{s.activity}</span>
                </div>
              </td>
              <td className="px-5 py-4 text-fg-muted">{projects.find((p) => p.id === s.project)?.name}</td>
              <td className="px-5 py-4 text-fg-muted">{s.start} → {s.end}</td>
              <td className="px-5 py-4">
                <span className={s.float === 0 ? "font-medium text-critical" : "text-fg-muted"}>
                  {s.float === 0 ? "0 d" : `${s.float} d`}
                </span>
              </td>
              <td className="px-5 py-4">
                <div className="flex w-40 items-center gap-2">
                  <Progress value={s.progress} tone={s.critical && s.progress < 50 ? "caution" : "neutral"} />
                  <span className="text-xs text-fg-faint">{s.progress}%</span>
                </div>
              </td>
            </tr>
          ))}
        </Table>
      </Card>
    </>
  );
}
