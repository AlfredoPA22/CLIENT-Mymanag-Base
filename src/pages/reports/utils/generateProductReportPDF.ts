import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IFilterProductInput,
  IProduct,
} from "../../../utils/interfaces/Product";

// ── Design tokens — sober, white-based ───────────────────────
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

export const generateProductReportPDF = (
  data: IProduct[],
  currency: string,
  filters: IFilterProductInput
) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const PAGE_W = doc.internal.pageSize.getWidth();

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE BLOCK ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE PRODUCTOS", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.length} registro${data.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, 22, PAGE_W);

  // ── FILTER ROW ────────────────────────────────────────────
  const filterY = 27;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("FILTROS:", MARGIN, filterY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  const filterText = [
    `Categoría: ${filters.category || "Todas"}`,
    `Marca: ${filters.brand || "Todas"}`,
    `Estado: ${filters.status || "Todos"}`,
  ].join("     ·     ");
  doc.text(filterText, MARGIN + 18, filterY);

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, filterY + 6, PAGE_W);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [[
      "Código",
      "Producto",
      "Categoría",
      "Marca",
      `Precio Venta (${currency})`,
      "Stock",
      "Estado",
    ]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((p) => [
      p.code,
      p.name,
      p.category.name,
      p.brand.name,
      p.sale_price,
      p.stock,
      p.status,
    ]),
    bodyStyles: { fontSize: 8, textColor: INK, cellPadding: 3 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 12,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 36, halign: "center" },
      1: { cellWidth: 66 },
      2: { cellWidth: 44 },
      3: { cellWidth: 44 },
      4: { cellWidth: 38, halign: "right" },
      5: { cellWidth: 22, halign: "center" },
      6: { cellWidth: 32, halign: "center" },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── PAGE FOOTER ───────────────────────────────────────────
  const PAGE_H = doc.internal.pageSize.getHeight();
  drawRule(doc, PAGE_H - 10, PAGE_W);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Reporte de Productos", MARGIN, PAGE_H - 6);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });

  doc.save("reporte_productos.pdf");
};
