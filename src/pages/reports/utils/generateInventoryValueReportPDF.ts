import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IProduct } from "../../../utils/interfaces/Product";

const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const TABLE_HEAD: [number, number, number] = [241, 245, 249];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const ACCENT: [number, number, number] = [160, 200, 46];

const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number, pageW: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageW - MARGIN, y);
};

export const generateInventoryValueReportPDF = (
  data: IProduct[],
  currency: string,
  filters: { category?: string; brand?: string }
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const PAGE_W = doc.internal.pageSize.getWidth(); // 297
  const PAGE_H = doc.internal.pageSize.getHeight();

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("INVENTARIO VALORIZADO", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.length} producto${data.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  drawRule(doc, 22, PAGE_W);

  // ── Filtros (izquierda) + Totales (derecha, apilados) ──────
  const filterY = 27;

  // Izquierda: filtros
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("FILTROS:", MARGIN, filterY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  doc.text(
    `Categoría: ${filters.category || "Todas"}     ·     Marca: ${filters.brand || "Todas"}`,
    MARGIN + 18,
    filterY
  );

  // Derecha: total costo (arriba) y total venta (abajo)
  const totalCosto = data.reduce(
    (s, p) => s + (Number(p.last_cost_price) || 0) * (Number(p.stock) || 0),
    0
  );
  const totalVenta = data.reduce(
    (s, p) => s + (Number(p.sale_price) || 0) * (Number(p.stock) || 0),
    0
  );

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("VAL. COSTO TOTAL", PAGE_W - MARGIN, filterY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(`${totalCosto.toFixed(2)} ${currency}`, PAGE_W - MARGIN, filterY + 6, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("VAL. VENTA TOTAL", PAGE_W - MARGIN, filterY + 13, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...INK);
  doc.text(`${totalVenta.toFixed(2)} ${currency}`, PAGE_W - MARGIN, filterY + 19, { align: "right" });

  drawRule(doc, filterY + 25, PAGE_W);

  // Columns total: 24+50+30+24+24+24+14+30+30 = 250 (≤ 269 available in landscape with both margins)
  autoTable(doc, {
    head: [[
      "Código",
      "Producto",
      "Categoría",
      "Marca",
      `Costo Unit.`,
      `Precio Vta.`,
      "Stock",
      `Val. Costo (${currency})`,
      `Val. Venta (${currency})`,
    ]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
    },
    body: data.map((p) => [
      p.code,
      p.name,
      p.category?.name || "-",
      p.brand?.name || "-",
      Number(p.last_cost_price || 0).toFixed(2),
      Number(p.sale_price || 0).toFixed(2),
      p.stock ?? 0,
      (Number(p.last_cost_price || 0) * Number(p.stock || 0)).toFixed(2),
      (Number(p.sale_price || 0) * Number(p.stock || 0)).toFixed(2),
    ]),
    bodyStyles: { fontSize: 7.5, textColor: INK, cellPadding: 3 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 31,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 30 },
      3: { cellWidth: 24 },
      4: { cellWidth: 24, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 14, halign: "center" },
      7: { cellWidth: 30, halign: "right" },
      8: { cellWidth: 30, halign: "right" },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  drawRule(doc, PAGE_H - 10, PAGE_W);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Inventario Valorizado", MARGIN, PAGE_H - 6);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });

  doc.save("inventario_valorizado.pdf");
};
