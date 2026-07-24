// Schematic previews for AI-generated drawings. Line-art SVG stands in for the
// real generated CAD/BIM output; each drawing type gets a recognisable
// schematic so the generative capability reads at a glance.

const stroke = "var(--color-fg-muted)";
const faint = "var(--color-fg-faint)";
const accent = "var(--color-accent)";

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 240 160" className="h-full w-full" role="img">
      <rect x="0" y="0" width="240" height="160" fill="var(--color-base)" />
      <rect x="6" y="6" width="228" height="148" fill="none" stroke={faint} strokeWidth="1" />
      {children}
    </svg>
  );
}

function FloorPlan() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="1.5" fill="none">
        <rect x="24" y="24" width="192" height="112" />
        <line x1="108" y1="24" x2="108" y2="136" />
        <line x1="108" y1="84" x2="216" y2="84" />
        <line x1="24" y1="84" x2="70" y2="84" />
        <line x1="70" y1="84" x2="70" y2="136" />
        {/* door swings */}
        <path d="M108 60 A12 12 0 0 1 96 48" stroke={accent} />
        <path d="M150 84 A12 12 0 0 1 162 96" stroke={accent} />
      </g>
      <g fill={faint} fontSize="7" fontFamily="monospace">
        <text x="52" y="56">WARD A</text>
        <text x="150" y="56">WARD B</text>
        <text x="34" y="112">CORE</text>
        <text x="150" y="114">THEATRE</text>
      </g>
      <line x1="24" y1="146" x2="70" y2="146" stroke={accent} strokeWidth="1" />
      <text x="30" y="143" fill={accent} fontSize="6" fontFamily="monospace">6.0m</text>
    </Frame>
  );
}

function StructuralGA() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="1.4">
        {[40, 90, 140, 190].map((x) => (
          <line key={x} x1={x} y1="28" x2={x} y2="132" />
        ))}
        {[40, 70, 100, 130].map((y) => (
          <line key={y} x1="28" y1={y} x2="212" y2={y} />
        ))}
      </g>
      {/* columns */}
      {[40, 90, 140, 190].flatMap((x) =>
        [40, 70, 100, 130].map((y) => (
          <rect key={`${x}-${y}`} x={x - 3} y={y - 3} width="6" height="6" fill={accent} />
        )),
      )}
      <g fill={faint} fontSize="6" fontFamily="monospace">
        <text x="36" y="22">1</text>
        <text x="86" y="22">2</text>
        <text x="136" y="22">3</text>
        <text x="186" y="22">4</text>
        <text x="18" y="42">A</text>
        <text x="18" y="72">B</text>
      </g>
    </Frame>
  );
}

function MechanicalLayout() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="1.4" fill="none">
        <circle cx="60" cy="60" r="18" />
        <circle cx="60" cy="60" r="6" fill={accent} stroke="none" />
        <circle cx="120" cy="100" r="14" />
        <rect x="160" y="44" width="44" height="32" />
        {/* pipe runs */}
        <path d="M78 60 H140 V44" stroke={accent} />
        <path d="M60 78 V116 H120 V114" stroke={accent} />
        <path d="M134 100 H182 V76" stroke={accent} />
      </g>
      <g fill={faint} fontSize="6" fontFamily="monospace">
        <text x="48" y="94">PUMP-01</text>
        <text x="104" y="122">CHILLER</text>
        <text x="166" y="40">AHU-2</text>
      </g>
    </Frame>
  );
}

function ElectricalSLD() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="1.4" fill="none">
        <line x1="120" y1="20" x2="120" y2="40" />
        <circle cx="120" cy="30" r="4" fill={accent} stroke="none" />
        <rect x="105" y="40" width="30" height="16" />
        <line x1="120" y1="56" x2="120" y2="72" />
        <line x1="40" y1="72" x2="200" y2="72" />
        {[40, 90, 150, 200].map((x) => (
          <g key={x}>
            <line x1={x} y1="72" x2={x} y2="92" />
            <rect x={x - 6} y="92" width="12" height="10" />
            <line x1={x} y1="102" x2={x} y2="120" />
            <circle cx={x} cy="126" r="6" stroke={accent} />
          </g>
        ))}
      </g>
      <g fill={faint} fontSize="6" fontFamily="monospace">
        <text x="128" y="52">MV/LV</text>
        <text x="24" y="140">FDR-1</text>
        <text x="182" y="140">FDR-4</text>
      </g>
    </Frame>
  );
}

function HvacDucting() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="6" fill="none" opacity="0.5">
        <path d="M30 46 H150 V120" />
      </g>
      <g stroke={accent} strokeWidth="1.4" fill="none">
        <path d="M30 46 H150 V120" />
        {[60, 90, 120].map((x) => (
          <line key={x} x1={x} y1="46" x2={x} y2="34" />
        ))}
        {[70, 100].map((y) => (
          <line key={y} x1="150" y1={y} x2="166" y2={y} />
        ))}
      </g>
      <rect x="20" y="36" width="16" height="20" fill="none" stroke={stroke} strokeWidth="1.4" />
      <g fill={faint} fontSize="6" fontFamily="monospace">
        <text x="16" y="68">AHU</text>
        <text x="120" y="134">Ø400 supply</text>
      </g>
    </Frame>
  );
}

function Fabrication() {
  return (
    <Frame>
      <g stroke={stroke} strokeWidth="1.4" fill="none">
        {/* I-beam elevation */}
        <line x1="40" y1="50" x2="200" y2="50" />
        <line x1="40" y1="58" x2="200" y2="58" />
        <line x1="118" y1="50" x2="118" y2="110" />
        <line x1="122" y1="50" x2="122" y2="110" />
        <line x1="90" y1="110" x2="150" y2="110" />
        <line x1="90" y1="118" x2="150" y2="118" />
        {/* bolt holes */}
        {[100, 110, 130, 140].map((x) => (
          <circle key={x} cx={x} cy="114" r="2" fill={accent} stroke="none" />
        ))}
      </g>
      <g fill={faint} fontSize="6" fontFamily="monospace">
        <text x="150" y="46">203x133 UB</text>
        <text x="90" y="134">M20 x4</text>
      </g>
    </Frame>
  );
}

const map: Record<string, () => React.ReactElement> = {
  "Floor plan": FloorPlan,
  "Structural GA": StructuralGA,
  "Mechanical layout": MechanicalLayout,
  "Electrical SLD": ElectricalSLD,
  "HVAC ducting": HvacDucting,
  "Fabrication drawing": Fabrication,
};

export default function DrawingPreview({ type }: { type: string }) {
  const Comp = map[type] ?? FloorPlan;
  return (
    <div className="aspect-[3/2] w-full overflow-hidden rounded-md border border-edge bg-base">
      <Comp />
    </div>
  );
}
