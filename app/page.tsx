import Link from "next/link";

const modules = [
  {
    name: "Command Center",
    desc: "Ask questions of your whole portfolio. Every KPI, risk, and forecast in one executive view — with the reasoning behind each recommendation.",
  },
  {
    name: "Engineering Studio",
    desc: "Automated drawing review, compliance checking, clash detection, and revision control across every discipline.",
  },
  {
    name: "Procurement Studio",
    desc: "RFQs generated, quotes benchmarked against live market pricing, purchase orders issued, and deliveries tracked — in one flow.",
  },
  {
    name: "Construction Studio",
    desc: "Programmes, critical path, labour and equipment allocation, and daily site plans that update themselves as reality changes.",
  },
  {
    name: "Manufacturing Studio",
    desc: "Fabrication packages, BOMs, production scheduling, and factory selection connected directly to the project model.",
  },
  {
    name: "Finance Studio",
    desc: "Cashflow simulation, margin forecasting, valuations, and invoice validation drawn from the same data the site runs on.",
  },
];

const outcomes = [
  { stat: "80%", label: "of large projects run over budget", note: "industry benchmark" },
  { stat: "20+", label: "disconnected tools in a typical contractor's stack", note: "replaced by one platform" },
  { stat: "1", label: "source of truth from concept to operation", note: "every stakeholder, one model" },
];

const steps = [
  { n: "01", t: "Upload", d: "Drawings, BIM models, contracts, and specifications are indexed and understood automatically." },
  { n: "02", t: "Analyse", d: "Engineering review, quantity takeoff, cost estimate, and risk profile generated from the model." },
  { n: "03", t: "Procure", d: "Suppliers discovered, RFQs issued, quotes benchmarked, and orders placed with full audit trails." },
  { n: "04", t: "Build", d: "Schedule, labour, and equipment coordinated live; delays predicted before they happen." },
  { n: "05", t: "Operate", d: "Handover documentation assembles itself; the digital twin lives on for the life of the asset." },
];

const tiers = [
  {
    name: "Starter",
    price: "R8,000",
    per: "/month",
    for: "Small engineering firms",
    features: ["10 users", "Project workspace", "Document intelligence", "Core AI review"],
  },
  {
    name: "Professional",
    price: "R30,000",
    per: "/month",
    for: "Growing contractors",
    features: ["50 users", "Engineering AI", "Procurement Studio", "Cost management", "Scheduling"],
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    per: "",
    for: "National contractors & developers",
    features: ["Unlimited users", "Private cloud & SSO", "Custom AI agents", "API access", "Dedicated success team"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-ink-950 text-ink-100">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-signal-500 font-bold text-white">
              A
            </span>
            <span className="text-lg font-semibold tracking-tight text-white">Atlas</span>
          </div>
          <nav className="hidden items-center gap-8 text-sm text-ink-300 md:flex">
            <a href="#platform" className="hover:text-white">Platform</a>
            <a href="#how" className="hover:text-white">How it works</a>
            <a href="#pricing" className="hover:text-white">Pricing</a>
          </nav>
          <Link
            href="/dashboard"
            className="rounded-md bg-signal-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-signal-600"
          >
            Open platform
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #1b2330 1px, transparent 1px), linear-gradient(to bottom, #1b2330 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-24 text-center">
          <p className="mb-5 inline-block rounded-full border border-ink-600 px-4 py-1 text-xs font-medium uppercase tracking-widest text-ink-300">
            The Infrastructure Intelligence Platform
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-white md:text-6xl">
            The operating system for infrastructure
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-300">
            One intelligent platform that coordinates every stage of infrastructure creation —
            engineering, manufacturing, procurement, construction, finance, and operations.
            From idea to infrastructure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="rounded-md bg-signal-500 px-6 py-3 font-medium text-white transition hover:bg-signal-600"
            >
              Explore the platform
            </Link>
            <a
              href="#platform"
              className="rounded-md border border-ink-600 px-6 py-3 font-medium text-ink-100 transition hover:border-ink-400"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Problem stats */}
      <section className="border-y border-ink-700/60 bg-ink-900">
        <div className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-3">
          {outcomes.map((o) => (
            <div key={o.label} className="text-center md:text-left">
              <div className="text-4xl font-semibold text-signal-400">{o.stat}</div>
              <div className="mt-2 text-ink-100">{o.label}</div>
              <div className="mt-1 text-sm text-ink-400">{o.note}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Modules */}
      <section id="platform" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Every department. One connected system.
        </h2>
        <p className="mt-4 max-w-2xl text-ink-300">
          Construction runs on dozens of disconnected tools. Atlas replaces the copy-paste economy
          between them with one continuously updated project model that every module — and every
          AI agent — reads and writes.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div
              key={m.name}
              className="rounded-lg border border-ink-700 bg-ink-900 p-6 transition hover:border-ink-600"
            >
              <h3 className="font-semibold text-white">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-300">{m.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-y border-ink-700/60 bg-ink-900">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">
            From idea to infrastructure
          </h2>
          <p className="mt-4 max-w-2xl text-ink-300">
            No manual re-entry between stages. Each phase inherits everything the last one learned.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            {steps.map((s) => (
              <div key={s.n}>
                <div className="font-mono text-sm text-signal-400">{s.n}</div>
                <div className="mt-2 font-semibold text-white">{s.t}</div>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
        <h2 className="text-center text-3xl font-semibold tracking-tight text-white md:text-4xl">
          Predictable pricing. Measurable ROI.
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-center text-ink-300">
          No per-request AI metering. Pick a plan, connect your projects, and measure the savings.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`rounded-lg border p-8 ${
                t.highlight
                  ? "border-signal-500 bg-ink-900"
                  : "border-ink-700 bg-ink-900/60"
              }`}
            >
              <div className="text-sm font-medium uppercase tracking-wider text-ink-400">
                {t.name}
              </div>
              <div className="mt-3 text-3xl font-semibold text-white">
                {t.price}
                <span className="text-base font-normal text-ink-400">{t.per}</span>
              </div>
              <div className="mt-1 text-sm text-ink-300">{t.for}</div>
              <ul className="mt-6 space-y-2 text-sm text-ink-100">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-0.5 text-signal-400">—</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-ink-700/60 bg-ink-900">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-white">
            Every building deserves a digital twin before the first brick is laid.
          </h2>
          <Link
            href="/dashboard"
            className="mt-8 inline-block rounded-md bg-signal-500 px-8 py-3 font-medium text-white transition hover:bg-signal-600"
          >
            Open the platform
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-700/60 py-10 text-center text-sm text-ink-400">
        Atlas — The Infrastructure Intelligence Platform. © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
