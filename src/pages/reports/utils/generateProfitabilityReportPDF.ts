import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IFilterProfitabilityInput,
  IProfitabilityReport,
} from "../../../utils/interfaces/Profitability";

// ── Design tokens ─────────────────────────────────────────────
const INK: [number, number, number]       = [30, 41, 59];
const INK_MID: [number, number, number]   = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number]      = [203, 213, 225];
const TABLE_HEAD: [number, number, number]= [241, 245, 249];
const ROW_ALT: [number, number, number]   = [248, 250, 252];
const ACCENT: [number, number, number]    = [160, 200, 46];
const GREEN: [number, number, number]     = [22, 163, 74];
const RED: [number, number, number]       = [220, 38, 38];

const PAGE_W = 297; // landscape A4
const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
};

const marginColor = (pct: number): [number, number, number] =>
  pct >= 30 ? GREEN : pct >= 10 ? [217, 119, 6] : RED;

export const generateProfitabilityReportPDF = (
  data: IProfitabilityReport,
  currency: string,
  filters: IFilterProfitabilityInput
) => {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE ────────────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE RENTABILIDAD", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.by_product.length} producto${data.by_product.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN, 16, { align: "right" }
  );

  drawRule(doc, 22);

  // ── FILTROS + KPIs SUPERIORES ─────────────────────────────
  const fy = 28;
  const desde = filters.startDate
    ? new Date(filters.startDate).toLocaleDateString("es-ES")
    : "Sin filtro";
  const hasta = filters.endDate
    ? new Date(filters.endDate).toLocaleDateString("es-ES")
    : "Sin filtro";

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("PERÍODO", MARGIN, fy);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(`${desde}  —  ${hasta}`, MARGIN + 14, fy);

  doc.setFont("helvetica", "italic");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("* El costo se calcula con el último costo registrado de cada producto.", MARGIN, fy + 6);

  // KPIs: 4 cajas en la derecha
  const kpis = [
    { label: "INGRESOS",     value: `${currency} ${data.total_revenue.toFixed(2)}`,      color: INK },
    { label: "COSTO",        value: `${currency} ${data.total_cost.toFixed(2)}`,          color: INK_MID },
    { label: "GANANCIA",     value: `${currency} ${data.total_gross_profit.toFixed(2)}`,  color: data.total_gross_profit >= 0 ? GREEN : RED },
    { label: "MARGEN",       value: `${data.total_margin_percent.toFixed(1)}%`,           color: marginColor(data.total_margin_percent) },
  ];

  const kpiW = 48;
  const kpiX0 = PAGE_W - MARGIN - kpis.length * kpiW + 4;
  kpis.forEach((kpi, i) => {
    const x = kpiX0 + i * kpiW;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, fy - 6, kpiW - 3, 16, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6);
    doc.setTextColor(...INK_MID);
    doc.text(kpi.label, x + (kpiW - 3) / 2, fy - 1, { align: "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...kpi.color);
    doc.text(kpi.value, x + (kpiW - 3) / 2, fy + 6, { align: "center" });
  });

  drawRule(doc, fy + 12);

  // ── TABLA POR PRODUCTO ───────────────────────────────────
  const t1y = fy + 19;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text("POR PRODUCTO", MARGIN, t1y);

  autoTable(doc, {
    head: [["Código", "Producto", "Categoría", "Marca", "Uds.", `Ingresos (${currency})`, `Costo (${currency})`, `Ganancia (${currency})`, "Margen %"]],
    headStyles: {
      fillColor: TABLE_HEAD, textColor: INK, fontStyle: "bold",
      fontSize: 7, halign: "center",
      cellPadding: { top: 3, right: 2, bottom: 3, left: 2 },
    },
    body: data.by_product.map((p) => [
      p.product_code,
      p.product_name,
      p.category_name,
      p.brand_name,
      p.units_sold,
      p.revenue.toFixed(2),
      p.cost.toFixed(2),
      p.gross_profit.toFixed(2),
      `${p.margin_percent.toFixed(1)}%`,
    ]),
    bodyStyles: { fontSize: 7.5, textColor: INK, cellPadding: 3 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: t1y + 4,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      1: { cellWidth: 58 },
      2: { cellWidth: 36 },
      3: { cellWidth: 32 },
      4: { cellWidth: 14, halign: "center" },
      5: { cellWidth: 30, halign: "right" },
      6: { cellWidth: 30, halign: "right" },
      7: { cellWidth: 30, halign: "right" },
      8: { cellWidth: 17, halign: "center" },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 8) {
        const pct = parseFloat(String(hookData.cell.raw).replace("%", ""));
        hookData.cell.styles.textColor = marginColor(pct);
        hookData.cell.styles.fontStyle = "bold";
      }
      if (hookData.section === "body" && hookData.column.index === 7) {
        const val = parseFloat(String(hookData.cell.raw));
        hookData.cell.styles.textColor = val >= 0 ? GREEN : RED;
      }
    },
  });

  // ── TABLA POR CATEGORÍA ──────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text("POR CATEGORÍA", MARGIN, finalY);

  autoTable(doc, {
    head: [["Categoría", "Uds. vendidas", `Ingresos (${currency})`, `Costo (${currency})`, `Ganancia (${currency})`, "Margen %"]],
    headStyles: {
      fillColor: TABLE_HEAD, textColor: INK, fontStyle: "bold",
      fontSize: 7.5, halign: "center",
      cellPadding: { top: 3, right: 3, bottom: 3, left: 3 },
    },
    body: data.by_category.map((c) => [
      c.category_name,
      c.units_sold,
      c.revenue.toFixed(2),
      c.cost.toFixed(2),
      c.gross_profit.toFixed(2),
      `${c.margin_percent.toFixed(1)}%`,
    ]),
    bodyStyles: { fontSize: 8, textColor: INK, cellPadding: 3 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: finalY + 4,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 93 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 40, halign: "right" },
      3: { cellWidth: 40, halign: "right" },
      4: { cellWidth: 40, halign: "right" },
      5: { cellWidth: 26, halign: "center" },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 5) {
        const pct = parseFloat(String(hookData.cell.raw).replace("%", ""));
        hookData.cell.styles.textColor = marginColor(pct);
        hookData.cell.styles.fontStyle = "bold";
      }
      if (hookData.section === "body" && hookData.column.index === 4) {
        const val = parseFloat(String(hookData.cell.raw));
        hookData.cell.styles.textColor = val >= 0 ? GREEN : RED;
      }
    },
  });

  // ── FOOTER ────────────────────────────────────────────────
  const pageH = 210;
  drawRule(doc, pageH - 7);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Reporte de Rentabilidad", MARGIN, pageH - 3);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, pageH - 3, { align: "right" });

  doc.save("reporte_rentabilidad.pdf");
};
