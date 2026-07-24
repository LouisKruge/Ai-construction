// Fixed, non-interactive ambient backdrop for the platform shell: blueprint
// grid, drafting lines, gradient lighting, drifting particles, noise + vignette.
// Purely decorative — sits behind all content.

const particles = Array.from({ length: 10 }, (_, i) => ({
  left: `${(i * 47.3) % 100}%`,
  top: `${(i * 29.7) % 100}%`,
  size: (i % 3) + 1.5,
  delay: `${(i % 7) * 1.3}s`,
  dur: `${9 + (i % 6) * 2}s`,
  op: 0.1 + (i % 4) * 0.06,
}));

export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* dark navy base + blue ambient lighting */}
      <div className="absolute inset-0 bg-base" />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(900px 520px at 80% -6%, rgba(109,124,255,0.12), transparent 60%), radial-gradient(760px 520px at 8% 2%, rgba(168,85,247,0.07), transparent 55%), radial-gradient(700px 700px at 50% 120%, rgba(56,189,248,0.05), transparent 60%)",
        }}
      />
      {/* engineering blueprint grid (masked so it fades) */}
      <div className="bp-grid absolute inset-0" />
      {/* faint CAD drafting lines */}
      <svg className="absolute inset-0 h-full w-full opacity-[0.05]" preserveAspectRatio="none">
        <line x1="0" y1="18%" x2="100%" y2="18%" stroke="#6d7cff" strokeWidth="1" strokeDasharray="2 10" />
        <line x1="12%" y1="0" x2="12%" y2="100%" stroke="#6d7cff" strokeWidth="1" strokeDasharray="2 14" />
        <line x1="72%" y1="0" x2="72%" y2="100%" stroke="#6d7cff" strokeWidth="1" strokeDasharray="2 14" />
      </svg>
      {/* drifting particles */}
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-accent"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            opacity: p.op,
            filter: "blur(0.5px)",
            animation: `drift ${p.dur} ease-in-out ${p.delay} infinite`,
          }}
        />
      ))}
      {/* fine noise + vignette */}
      <div className="noise absolute inset-0 opacity-[0.03] mix-blend-overlay" />
      <div className="vignette absolute inset-0" />
    </div>
  );
}
