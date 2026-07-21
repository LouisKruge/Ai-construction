// Stylised isometric building massing — a lightweight CSS/SVG stand-in for a
// real BIM/3D viewport. Reads as a rendered tower on a blueprint stage:
// glass facets, edge highlights, ambient floor glow. No WebGL dependency.

export default function BuildingRender({ className = "" }: { className?: string }) {
  return (
    <div className={`blueprint relative overflow-hidden rounded-xl border border-edge bg-base ${className}`}>
      {/* ambient lighting */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-4 h-40 w-72 -translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-24 w-96 -translate-x-1/2 rounded-[100%] bg-accent-2/15 blur-2xl" />
      </div>

      <svg viewBox="0 0 360 300" className="relative h-full w-full">
        <defs>
          <linearGradient id="face-l" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1a2440" />
            <stop offset="1" stopColor="#0f1626" />
          </linearGradient>
          <linearGradient id="face-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#26314f" />
            <stop offset="1" stopColor="#151d31" />
          </linearGradient>
          <linearGradient id="face-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b4a72" />
            <stop offset="1" stopColor="#26314f" />
          </linearGradient>
          <linearGradient id="glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d7cff" stopOpacity="0.9" />
            <stop offset="1" stopColor="#38bdf8" stopOpacity="0.5" />
          </linearGradient>
        </defs>

        {/* ground plate */}
        <polygon points="180,250 320,190 180,130 40,190" fill="#0c1220" stroke="#212a3c" strokeWidth="1" />
        <polygon points="180,250 320,190 180,130 40,190" fill="none" stroke="#6d7cff" strokeOpacity="0.15" strokeWidth="1" />

        {/* podium */}
        <g>
          <polygon points="180,150 300,90 180,30 60,90" fill="url(#face-top)" />
          <polygon points="60,90 180,150 180,210 60,150" fill="url(#face-l)" />
          <polygon points="300,90 180,150 180,210 300,150" fill="url(#face-r)" />
        </g>

        {/* tower — stacked storeys */}
        {Array.from({ length: 9 }).map((_, i) => {
          const y = 150 - i * 16;
          const shrink = i * 2;
          const lx = 108 + shrink;
          const rx = 252 - shrink;
          const midY = y;
          return (
            <g key={i}>
              {/* left face */}
              <polygon
                points={`${lx},${midY} 180,${midY + 30} 180,${midY + 14} ${lx},${midY - 16}`}
                fill="url(#face-l)"
                stroke="#38bdf8"
                strokeOpacity="0.12"
                strokeWidth="0.6"
              />
              {/* right face */}
              <polygon
                points={`${rx},${midY} 180,${midY + 30} 180,${midY + 14} ${rx},${midY - 16}`}
                fill="url(#face-r)"
                stroke="#38bdf8"
                strokeOpacity="0.12"
                strokeWidth="0.6"
              />
            </g>
          );
        })}
        {/* top cap */}
        <polygon points="180,-4 236,28 180,60 124,28" fill="url(#face-top)" stroke="#6d7cff" strokeOpacity="0.4" strokeWidth="0.8" />

        {/* vertical edge highlight */}
        <line x1="180" y1="60" x2="180" y2="180" stroke="url(#glow)" strokeWidth="1.4" strokeOpacity="0.6" />

        {/* scan line */}
        <line x1="40" y1="118" x2="320" y2="118" stroke="#6d7cff" strokeOpacity="0.12" strokeWidth="1" strokeDasharray="3 4" />
      </svg>

      {/* HUD chips */}
      <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 text-[10px]">
        <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-fg-muted backdrop-blur">
          BIM · Rev D
        </span>
        <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-accent-cyan backdrop-blur">
          LOD 350
        </span>
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-edge bg-base/70 px-2 py-0.5 text-[10px] backdrop-blur">
        <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
        <span className="font-mono text-fg-muted">rendering · 60fps</span>
      </div>
    </div>
  );
}
