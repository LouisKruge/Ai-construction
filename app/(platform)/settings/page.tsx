import { team } from "@/lib/data";
import { Badge, Card, CardHeader, Kpi, PageHeader, Table } from "@/components/ui";

export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Organization, team access, and AI governance."
        actions={
          <button className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover">
            + Invite member
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Kpi label="Organization" value="Meridian CG" sub="Enterprise plan · ZA region" />
        <Kpi label="Members" value={String(team.length)} sub="2 admins · 1 client viewer" />
        <Kpi label="SSO" value="Enabled" sub="SAML · enforced for staff" tone="positive" />
        <Kpi label="Audit log" value="90 days" sub="all agent actions recorded" />
      </div>

      <Card className="mt-6">
        <CardHeader title="Team" />
        <Table headers={["Member", "Role", "Email", "Access", "Last active"]}>
          {team.map((t) => (
            <tr key={t.email} className="transition hover:bg-raise">
              <td className="px-5 py-4 font-medium text-fg">{t.name}</td>
              <td className="px-5 py-4 text-fg-muted">{t.role}</td>
              <td className="px-5 py-4 text-fg-muted">{t.email}</td>
              <td className="px-5 py-4">
                <Badge label={t.access === "Admin" ? "Awarded" : t.access === "Editor" ? "In review" : "Queued"} />
              </td>
              <td className="px-5 py-4 text-fg-muted">{t.lastActive}</td>
            </tr>
          ))}
        </Table>
      </Card>

      <Card className="mt-6">
        <CardHeader title="AI governance" />
        <div className="divide-y divide-edge text-sm">
          {[
            ["Human approval required", "Purchase orders above R500k, all contract commitments, schedule re-baselines."],
            ["Autonomous within limits", "RFQ issuance, quote benchmarking, report generation, document indexing."],
            ["Auditability", "Every agent recommendation stores its inputs, reasoning summary, and confidence."],
            ["Data sharing", "Benchmark contribution is opt-in and anonymized. Your data never trains other tenants' models."],
          ].map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 px-5 py-4 md:flex-row md:gap-6">
              <div className="w-56 shrink-0 font-medium text-fg">{k}</div>
              <div className="text-fg-muted">{v}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}
