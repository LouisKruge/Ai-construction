// Builds the system prompt for the Atlas assistant from the platform's shared
// data. This is the retrieval layer: the model answers over the same records
// the UI renders, so its answers stay grounded in real project state rather
// than invented facts. Server-only — imported by the API route.

import { projects, insights, rfqs, suppliers, fmt } from "@/lib/data";
import { departments, warRoom } from "@/lib/workforce";

export function buildSystemPrompt(): string {
  const portfolio = projects
    .map(
      (p) =>
        `- ${p.name} (${p.id}) · ${p.client} · ${p.sector} · phase ${p.phase} · status ${p.status} · budget ${fmt.zar(p.budget)} · spent ${fmt.zar(p.spent)} · progress ${p.progress}% vs planned ${p.plannedProgress}% · risk ${p.riskScore}/100 · ${p.openRfis} open RFIs · ${p.openDefects} open defects`,
    )
    .join("\n");

  const openInsights = insights
    .map((i) => `- [${i.severity}] ${i.agent}: ${i.title} — ${i.detail} Recommended: ${i.action} (confidence ${Math.round(i.confidence * 100)}%)`)
    .join("\n");

  const procurement = rfqs
    .map((r) => `- ${r.package} (${r.id}) · ${r.quotes} quotes · lowest ${r.lowest ? fmt.zar(r.lowest) : "—"} vs benchmark ${fmt.zar(r.benchmark)} · ${r.status}`)
    .join("\n");

  const supplierLines = suppliers
    .map((s) => `- ${s.name} · ${s.category} · on-time ${Math.round(s.onTimeRate * 100)}% · quality ${s.qualityScore}/5 · YTD spend ${fmt.zar(s.spendYtd)}`)
    .join("\n");

  const depts = departments
    .map((d) => `- ${d.name} (${d.chief}): ${d.summary}`)
    .join("\n");

  const briefing = warRoom
    .map((w) => `- [${w.kind}] ${w.title} — ${w.impact} (${w.source})`)
    .join("\n");

  return `You are Atlas, the AI assistant inside the Atlas infrastructure operating system — a platform that manages the full lifecycle of construction and infrastructure projects for Meridian Construction Group, a South African contractor.

Your job is to answer questions and give recommendations about this company's live project portfolio, using the data below. You are speaking to the company's executives and project teams.

## How to answer
- Be direct and concise. Lead with the answer, then the reasoning.
- Ground every claim in the data provided. Reference projects by name and ID (e.g. "Sandton Gate (PRJ-0142)").
- Use South African Rand (ZAR) for money, matching the format in the data (e.g. R486.0m).
- When you make a recommendation, state the expected impact and your confidence, and note key assumptions — mirror how the platform's agents work.
- If the data does not contain the answer, say so plainly. Do not invent numbers, suppliers, dates, or projects.
- You are a decision-support tool. For anything that commits money or changes a contract, note that it needs human approval.

## Live portfolio
${portfolio}

## Open agent insights
${openInsights}

## Procurement — open RFQs (lowest quote vs platform benchmark)
${procurement}

## Key suppliers
${supplierLines}

## AI departments available in the platform
${depts}

## This morning's War Room briefing
${briefing}

Today's date is 21 July 2026. Answer as Atlas.`;
}
