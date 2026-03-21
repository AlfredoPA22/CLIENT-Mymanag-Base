import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ISaleOrder } from "../../../utils/interfaces/SaleOrder";

const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const TABLE_HEAD: [number, number, number] = [241, 245, 249];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const ACCENT: [number, number, number] = [160, 200, 46];

const PAGE_W = 210;
const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
};

export const generateCuentasCobrarReportPDF = (
  data: ISaleOrder[],
  currency: string,
  filters: { startDate?: Date | null; endDate?: Date | null }
) => {
  const doc = new jsPDF({ orientation: "portrait" });

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("CUENTAS POR COBRAR", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.length} factura${data.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  drawRule(doc, 22);

  const filterY = 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("PERÍODO", MARGIN, filterY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  const desde = filters.startDate
    ? new Date(filters.startDate).toLocaleDateString("es-ES")
    : "Sin filtro";
  const hasta = filters.endDate
    ? new Date(filters.endDate).toLocaleDateString("es-ES")
    : "Sin filtro";
  doc.text(`${desde}  —  ${hasta}`, MARGIN + 18, filterY);

  const total = data.reduce((s, o) => s + (Number(o.total) || 0), 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("TOTAL PENDIENTE", PAGE_W - MARGIN, filterY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(220, 38, 38);
  doc.text(`${total.toFixed(2)} ${currency}`, PAGE_W - MARGIN, filterY + 9, { align: "right" });

  drawRule(doc, filterY + 16);

  autoTable(doc, {
    head: [["Código", "Fecha", "Cliente", `Total (${currency})`]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((o) => [
      o.code,
      new Date(Number(o.date)).toLocaleDateString("es-ES"),
      o.client?.fullName || "-",
      Number(o.total || 0).toFixed(2),
    ]),
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 22,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 36, halign: "center" },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 95 },
      3: { cellWidth: 25, halign: "right" },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  drawRule(doc, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Cuentas por Cobrar", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save("cuentas_por_cobrar.pdf");
};
