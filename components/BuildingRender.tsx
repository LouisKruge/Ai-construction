// Architectural-visualization render of a modern mixed-use tower at dusk — a
// layered SVG scene (glass tower + podium, warm-lit windows, landscaped plaza,
// reflections, ambient dusk lighting) that reads like a rendered BIM view.
// No WebGL / raster assets.

import type { ReactNode } from "react";

type P = [number, number];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const quadPt = (tl: P, tr: P, bl: P, br: P, s: number, t: number): P =>
  lerp(lerp(tl, tr, s), lerp(bl, br, s), t);
const pts = (...ps: P[]) => ps.map((p) => p.join(",")).join(" ");

// A glazed façade: base glass fill + lit windows + floor/mullion lines.
function facade(
  tl: P, tr: P, bl: P, br: P,
  opts: { floors: number; cols: number; glass: string; dim?: number; keyBase: string },
) {
  const { floors, cols, glass, dim = 1, keyBase } = opts;
  const cells: ReactNode[] = [];
  for (let r = 0; r < floors; r++) {
    for (let c = 0; c < cols; c++) {
      const warm = (r * 7 + c * 13) % 9 < 2;
      const cool = !warm && (r * 3 + c * 5) % 11 < 2;
      if (!warm && !cool) continue;
      const p0 = quadPt(tl, tr, bl, br, (c + 0.12) / cols, (r + 0.12) / floors);
      const p1 = quadPt(tl, tr, bl, br, (c + 0.88) / cols, (r + 0.12) / floors);
      const p2 = quadPt(tl, tr, bl, br, (c + 0.88) / cols, (r + 0.88) / floors);
      const p3 = quadPt(tl, tr, bl, br, (c + 0.12) / cols, (r + 0.88) / floors);
      cells.push(
        <polygon
          key={`${keyBase}-w-${r}-${c}`}
          points={pts(p0, p1, p2, p3)}
          fill={warm ? "#ffcf8a" : "#bcd4ff"}
          opacity={(warm ? 0.6 : 0.42) * dim}
        />,
      );
    }
  }
  const lines: ReactNode[] = [];
  for (let k = 1; k < floors; k++) {
    const t = k / floors;
    const a = lerp(tl, bl, t);
    const b = lerp(tr, br, t);
    lines.push(<line key={`${keyBase}-fl-${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0a1226" strokeWidth="0.6" opacity={0.55 * dim} />);
  }
  for (let k = 1; k < cols; k++) {
    const s = k / cols;
    const a = lerp(tl, tr, s);
    const b = lerp(bl, br, s);
    lines.push(<line key={`${keyBase}-mu-${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0a1226" strokeWidth="0.5" opacity={0.45 * dim} />);
  }
  return (
    <g>
      <polygon points={pts(tl, tr, br, bl)} fill={glass} />
      {cells}
      {lines}
    </g>
  );
}

// tree
function Tree({ x, y, s = 1 }: { x: number; y: number; s?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <ellipse cx="0" cy="-6" rx="6" ry="8" fill="#1f4a37" />
      <ellipse cx="-2" cy="-8" rx="4" ry="5" fill="#2b6a4d" opacity="0.8" />
      <rect x="-1" y="-2" width="2" height="6" fill="#123" />
    </g>
  );
}

export default function BuildingRender({
  className = "",
  chrome = true,
}: {
  className?: string;
  chrome?: boolean;
}) {
  // ── tower geometry (front + right faces + roof) ──
  const tFL: P = [258, 96], tFR: P = [368, 110], tBRr: P = [368, 292], tBL: P = [258, 282];
  const tSbT: P = [414, 130], tSbB: P = [414, 268]; // side back top / bottom
  // ── podium geometry ──
  const pFL: P = [214, 254], pFR: P = [400, 268], pBR: P = [400, 322], pBL: P = [214, 312];
  const pSbT: P = [452, 250], pSbB: P = [452, 304];

  return (
    <div className={`relative overflow-hidden rounded-xl border border-edge ${className}`}>
      <svg viewBox="0 0 640 400" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0b1330" />
            <stop offset="0.55" stopColor="#152046" />
            <stop offset="0.8" stopColor="#3a3457" />
            <stop offset="1" stopColor="#5b4a63" />
          </linearGradient>
          <radialGradient id="sun" cx="0.72" cy="0.72" r="0.5">
            <stop offset="0" stopColor="#ffb27a" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffb27a" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="glassA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3d4f80" />
            <stop offset="0.5" stopColor="#243257" />
            <stop offset="1" stopColor="#1a2340" />
          </linearGradient>
          <linearGradient id="glassSide" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1b2440" />
            <stop offset="1" stopColor="#10182e" />
          </linearGradient>
          <linearGradient id="glassPod" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2c3c66" />
            <stop offset="1" stopColor="#1c2b4e" />
          </linearGradient>
          <linearGradient id="plaza" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#141d38" />
            <stop offset="1" stopColor="#0a1024" />
          </linearGradient>
          <linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#6d7cff" stopOpacity="0.28" />
            <stop offset="1" stopColor="#6d7cff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="amb" cx="0.5" cy="0.4" r="0.55">
            <stop offset="0" stopColor="#6d7cff" stopOpacity="0.22" />
            <stop offset="1" stopColor="#6d7cff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* sky + sun + ambient */}
        <rect x="0" y="0" width="640" height="400" fill="url(#sky)" />
        <rect x="0" y="0" width="640" height="400" fill="url(#sun)" />
        <rect x="120" y="40" width="420" height="300" fill="url(#amb)" />

        {/* distant skyline */}
        {[[70, 210, 24, 44], [104, 224, 18, 30], [500, 214, 26, 40], [536, 226, 20, 28], [566, 218, 16, 36], [40, 226, 16, 28]].map(
          ([x, y, w, h], i) => (
            <g key={`sk-${i}`}>
              <rect x={x} y={y} width={w} height={h} fill="#0d1530" opacity="0.85" />
              {Array.from({ length: 3 }).map((_, k) => (
                <rect key={k} x={(x as number) + 3} y={(y as number) + 5 + k * 9} width={(w as number) - 6} height="3" fill="#ffce8a" opacity={0.25 + (i % 2) * 0.1} />
              ))}
            </g>
          ),
        )}

        {/* plaza */}
        <polygon points={pts([0, 400], [640, 400], [520, 250], [120, 250])} fill="url(#plaza)" />
        {/* plaza path lines (perspective) */}
        {[0.2, 0.4, 0.6, 0.8].map((s, i) => {
          const a = lerp([120, 250], [520, 250], s);
          const b = lerp([0, 400], [640, 400], s);
          return <line key={`pp-${i}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#243257" strokeWidth="0.8" opacity="0.5" />;
        })}
        {[280, 330, 380].map((y, i) => (
          <line key={`ph-${i}`} x1={120 - (y - 250) * 0.5} y1={y} x2={520 + (y - 250) * 0.5} y2={y} stroke="#243257" strokeWidth="0.7" opacity="0.4" />
        ))}

        {/* landscaping */}
        <ellipse cx="150" cy="345" rx="60" ry="16" fill="#173a2c" opacity="0.8" />
        <ellipse cx="500" cy="340" rx="70" ry="16" fill="#173a2c" opacity="0.7" />
        <Tree x={130} y={332} s={1.2} />
        <Tree x={175} y={344} s={1} />
        <Tree x={480} y={330} s={1.1} />
        <Tree x={520} y={342} s={1.3} />
        <Tree x={548} y={330} s={0.9} />

        {/* reflection under building */}
        <polygon points={pts([230, 322], [430, 322], [420, 372], [240, 372])} fill="url(#reflect)" />

        {/* ── tower ── */}
        {/* roof */}
        <polygon points={pts(tFL, tFR, tSbT, [302, 116])} fill="#2a3a63" />
        {/* right face */}
        {facade(tFR, tSbT, tBRr, tSbB, { floors: 20, cols: 3, glass: "url(#glassSide)", dim: 0.7, keyBase: "t-side" })}
        {/* front face */}
        {facade(tFL, tFR, tBL, tBRr, { floors: 20, cols: 7, glass: "url(#glassA)", keyBase: "t-front" })}
        {/* corner highlight */}
        <line x1={tFR[0]} y1={tFR[1]} x2={tBRr[0]} y2={tBRr[1]} stroke="#8ea2ff" strokeWidth="1" opacity="0.5" />
        {/* crown + mast */}
        <rect x="286" y="82" width="54" height="14" fill="#243257" />
        <line x1="313" y1="60" x2="313" y2="82" stroke="#8ea2ff" strokeWidth="1.1" opacity="0.7" />
        <circle cx="313" cy="60" r="2" fill="#38bdf8" />

        {/* ── podium (in front) ── */}
        {/* top */}
        <polygon points={pts(pFL, pFR, pSbT, [266, 236])} fill="#22315a" />
        {/* right */}
        {facade(pFR, pSbT, pBR, pSbB, { floors: 4, cols: 3, glass: "url(#glassSide)", dim: 0.7, keyBase: "p-side" })}
        {/* front */}
        {facade(pFL, pFR, pBL, pBR, { floors: 4, cols: 11, glass: "url(#glassA)", keyBase: "p-front" })}
        {/* podium canopy edge highlight */}
        <line x1={pFL[0]} y1={pFL[1]} x2={pFR[0]} y2={pFR[1]} stroke="#9fb2ff" strokeWidth="1" opacity="0.45" />

        {/* foreground road + car lights */}
        <polygon points={pts([0, 400], [640, 400], [560, 356], [80, 356])} fill="#0a0f20" />
        {[[180, 372], [260, 380], [430, 374], [360, 384]].map(([x, y], i) => (
          <circle key={`car-${i}`} cx={x} cy={y} r="2.4" fill={i % 2 ? "#ff6b6b" : "#ffdf9e"} opacity="0.9" />
        ))}
        {/* street lamps */}
        {[110, 545].map((x, i) => (
          <g key={`lamp-${i}`}>
            <line x1={x} y1="330" x2={x} y2="360" stroke="#2a3760" strokeWidth="1.4" />
            <circle cx={x} cy="330" r="2.4" fill="#ffe1a6" opacity="0.9" />
            <circle cx={x} cy="330" r="6" fill="#ffe1a6" opacity="0.18" />
          </g>
        ))}
      </svg>

      {/* HUD chips */}
      {chrome && (
        <>
          <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 text-[10px]">
            <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-fg-muted backdrop-blur">BIM · Rev D</span>
            <span className="rounded border border-edge bg-base/70 px-2 py-0.5 font-mono text-accent-cyan backdrop-blur">LOD 350</span>
          </div>
          <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded border border-edge bg-base/70 px-2 py-0.5 text-[10px] backdrop-blur">
            <span className="live-dot h-1.5 w-1.5 rounded-full bg-positive" />
            <span className="font-mono text-fg-muted">Rendering · 60fps</span>
          </div>
        </>
      )}
    </div>
  );
}
