function trigger(url: string, name: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function exportSVG(svg: SVGSVGElement, name: string) {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  const src = new XMLSerializer().serializeToString(clone);
  const url = URL.createObjectURL(new Blob([src], { type: "image/svg+xml" }));
  trigger(url, `${name}.svg`);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

// rasterise an SVG element to a canvas, then hand back a PNG data URL
function svgToCanvas(svg: SVGSVGElement, scale = 2): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const vb = svg.viewBox.baseVal;
    const w = (vb && vb.width) || svg.clientWidth || 800;
    const h = (vb && vb.height) || svg.clientHeight || 600;
    const src = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = w * scale;
      c.height = h * scale;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = "#070a12";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      resolve(c);
    };
    img.onerror = reject;
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(src)));
  });
}

export async function exportPNG(svg: SVGSVGElement, name: string) {
  const c = await svgToCanvas(svg, 2);
  trigger(c.toDataURL("image/png"), `${name}.png`);
}

export async function exportPDF(svg: SVGSVGElement, name: string) {
  const { jsPDF } = await import("jspdf"); // lazy — keep jsPDF out of the initial bundle
  const c = await svgToCanvas(svg, 2);
  const landscape = c.width >= c.height;
  const pdf = new jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "pt", format: "a3" });
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const m = 36;
  const scale = Math.min((pw - m * 2) / c.width, (ph - m * 2 - 40) / c.height);
  const iw = c.width * scale, ih = c.height * scale;
  pdf.setFillColor(9, 12, 20);
  pdf.rect(0, 0, pw, ph, "F");
  pdf.setTextColor(180, 190, 210);
  pdf.setFontSize(11);
  pdf.text(`ATLAS · ${name}`, m, 28);
  pdf.text(new Date().toLocaleString(), pw - m, 28, { align: "right" });
  pdf.addImage(c.toDataURL("image/png"), "PNG", (pw - iw) / 2, 44, iw, ih);
  pdf.save(`${name}.pdf`);
}

// Minimal DXF (R12 ASCII) plan export — real CAD interchange (opens in AutoCAD).
export function exportDXF({ width, depth, name }: { width: number; depth: number; name: string }) {
  const lines: string[] = [];
  const L = (x1: number, y1: number, x2: number, y2: number, layer = "SLAB") =>
    lines.push("0", "LINE", "8", layer, "10", `${x1}`, "20", `${y1}`, "11", `${x2}`, "21", `${y2}`);
  // slab outline
  L(0, 0, width, 0); L(width, 0, width, depth); L(width, depth, 0, depth); L(0, depth, 0, 0);
  // structural grid
  const cols = Math.round(width / 8), rows = Math.round(depth / 8);
  for (let i = 0; i <= cols; i++) L((i * width) / cols, -1, (i * width) / cols, depth + 1, "GRID");
  for (let j = 0; j <= rows; j++) L(-1, (j * depth) / rows, width + 1, (j * depth) / rows, "GRID");
  // core
  L(width * 0.4, depth * 0.36, width * 0.6, depth * 0.36, "CORE");
  L(width * 0.6, depth * 0.36, width * 0.6, depth * 0.64, "CORE");
  L(width * 0.6, depth * 0.64, width * 0.4, depth * 0.64, "CORE");
  L(width * 0.4, depth * 0.64, width * 0.4, depth * 0.36, "CORE");
  const dxf = ["0", "SECTION", "2", "ENTITIES", ...lines, "0", "ENDSEC", "0", "EOF"].join("\n");
  const url = URL.createObjectURL(new Blob([dxf], { type: "application/dxf" }));
  trigger(url, `${name}.dxf`);
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function exportCanvasPNG(canvas: HTMLCanvasElement, name: string) {
  trigger(canvas.toDataURL("image/png"), `${name}.png`);
}
