// Stylised glass tower in 3/4 perspective — a lightweight SVG stand-in for a
// real BIM/3D viewport. Two curtain-wall faces with floor plates, mullions and
// lit windows on a dark city stage. No WebGL dependency.

type P = [number, number];
const lerp = (a: P, b: P, t: number): P => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
// bilinear point inside a quad defined by corners tl,tr,bl,br
const quadPt = (tl: P, tr: P, bl: P, br: P, s: number, t: number): P =>
  lerp(lerp(tl, tr, s), lerp(bl, br, s), t);

export default function BuildingRender({
  className = "",
  chrome = true,
}: {
  className?: string;
  chrome?: boolean;
}) {
  // Front face corners (slight upward tilt to read as a low camera)
  const fTL: P = [150, 66], fTR: P = [250, 80], fBR: P = [250, 300], fBL: P = [150, 288];
  // Right (side) face — recedes to the back-right
  const sTL: P = fTR, sTR: P = [300, 104], sBR: P = [300, 266], sBL: P = fBR;

  const floors = 22;
  const fCols = 6;
  const sCols = 3;

  // deterministic "lit window" pattern on the front face
  const lit = (r: number, c: number) => (r * 3 + c * 7) % 11 < 3;

  // faint city lights behind the tower
  const dots = Array.from({ length: 54 }, (_, i) => ({
    x: (i * 137.5) % 400,
    y: 250 + ((i * 71) % 96),
    r: (i % 3) * 0.35 + 0.4,
    o: 0.12 + (i % 5) * 0.04,
  }));

  return (
    <div className={`relative overflow-hidden rounded-xl border border-edge bg-[#070a12] ${className}`}>
      <svg viewBox="0 0 400 340" className="h-full w-full">
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0c1430" />
            <stop offset="0.6" stopColor="#080d1c" />
            <stop offset="1" stopColor="#05070f" />
          </linearGradient>
          <linearGradient id="glass-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3a4a86" />
            <stop offset="0.5" stopColor="#1d2748" />
            <stop offset="1" stopColor="#141b33" />
          </linearGradient>
          <linearGradient id="glass-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#141c34" />
            <stop offset="1" stopColor="#0c1224" />
          </linearGradient>
          <linearGradient id="sheen-front" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#8ea2ff" stopOpacity="0.5" />
            <stop offset="0.25" stopColor="#8ea2ff" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="halo" cx="0.5" cy="0.35" r="0.6">
            <stop offset="0" stopColor="#6d7cff" stopOpacity="0.35" />
            <stop offset="1" stopColor="#6d7cff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="reflect" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a3568" stopOpacity="0.4" />
            <stop offset="1" stopColor="#2a3568" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* sky + ambient halo */}
        <rect x="0" y="0" width="400" height="340" fill="url(#sky)" />
        <rect x="60" y="10" width="280" height="240" fill="url(#halo)" />

        {/* city lights */}
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#6d7cff" opacity={d.o} />
        ))}

        {/* ground reflection */}
        <polygon points="150,300 250,300 300,266 300,320 150,320" fill="url(#reflect)" opacity="0.5" />

        {/* right (side) face */}
        <polygon points={`${sTL} ${sTR} ${sBR} ${sBL}`} fill="url(#glass-side)" />
        {/* front face */}
        <polygon points={`${fTL} ${fTR} ${fBR} ${fBL}`} fill="url(#glass-front)" />

        {/* lit windows on the front face */}
        {Array.from({ length: floors }).flatMap((_, r) =>
          Array.from({ length: fCols }).map((_, c) => {
            if (!lit(r, c)) return null;
            const p0 = quadPt(fTL, fTR, fBL, fBR, c / fCols, r / floors);
            const p1 = quadPt(fTL, fTR, fBL, fBR, (c + 1) / fCols, r / floors);
            const p2 = quadPt(fTL, fTR, fBL, fBR, (c + 1) / fCols, (r + 1) / floors);
            const p3 = quadPt(fTL, fTR, fBL, fBR, c / fCols, (r + 1) / floors);
            return (
              <polygon
                key={`${r}-${c}`}
                points={`${p0} ${p1} ${p2} ${p3}`}
                fill="#aebcff"
                opacity={0.14 + ((r + c) % 3) * 0.06}
              />
            );
          }),
        )}

        {/* front sheen highlight */}
        <polygon points={`${fTL} ${fTR} ${fBR} ${fBL}`} fill="url(#sheen-front)" />

        {/* front floor plates */}
        {Array.from({ length: floors - 1 }).map((_, k) => {
          const t = (k + 1) / floors;
          const a = lerp(fTL, fBL, t);
          const b = lerp(fTR, fBR, t);
          return <line key={`ff${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0a1024" strokeWidth="0.8" opacity="0.7" />;
        })}
        {/* front mullions */}
        {Array.from({ length: fCols - 1 }).map((_, k) => {
          const s = (k + 1) / fCols;
          const a = lerp(fTL, fTR, s);
          const b = lerp(fBL, fBR, s);
          return <line key={`fm${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#0a1024" strokeWidth="0.7" opacity="0.6" />;
        })}
        {/* side floor plates */}
        {Array.from({ length: floors - 1 }).map((_, k) => {
          const t = (k + 1) / floors;
          const a = lerp(sTL, sBL, t);
          const b = lerp(sTR, sBR, t);
          return <line key={`sf${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#05080f" strokeWidth="0.8" opacity="0.6" />;
        })}
        {/* side mullions */}
        {Array.from({ length: sCols - 1 }).map((_, k) => {
          const s = (k + 1) / sCols;
          const a = lerp(sTL, sTR, s);
          const b = lerp(sBL, sBR, s);
          return <line key={`sm${k}`} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} stroke="#05080f" strokeWidth="0.7" opacity="0.55" />;
        })}

        {/* vertical corner highlight (front-right edge) */}
        <line x1={fTR[0]} y1={fTR[1]} x2={fBR[0]} y2={fBR[1]} stroke="#8ea2ff" strokeWidth="1.1" opacity="0.5" />
        {/* roof outlines */}
        <polygon points={`${fTL} ${fTR} ${sTR} ${lerp(sTR, sTL, 1)}`} fill="#28356a" opacity="0.7" />
        {/* crown + mast */}
        <rect x="182" y="52" width="36" height="14" fill="#28356a" opacity="0.85" />
        <line x1="200" y1="30" x2="200" y2="52" stroke="#8ea2ff" strokeWidth="1.2" opacity="0.7" />
        <circle cx="200" cy="30" r="1.8" fill="#38bdf8" />
      </svg>

      {/* HUD chips */}
      {chrome && (
        <>
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
        </>
      )}
    </div>
  );
}
