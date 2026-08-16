import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICuentaCobrarRow } from "../../../utils/interfaces/SaleOrder";
import { convertCurrency, formatAmount } from "../../../utils/currency";

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

// Una nota puede haberse hecho en la moneda alterna de la empresa (Bs) —
// este reporte siempre se muestra en la moneda de la empresa, así que cada
// monto se convierte primero con el tipo de cambio congelado en su nota.
const toCompanyAmount = (row: ICuentaCobrarRow, amount: number, baseCurrency: string) =>
  convertCurrency(amount, row.sale_order.currency ?? baseCurrency, baseCurrency, row.sale_order.exchange_rate);

export const generateCuentasCobrarReportPDF = (
  data: ICuentaCobrarRow[],
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

  drawRule(doc, filterY + 6);

  // ── Resumen: vendido / pagado / pendiente ──────────────────
  const totalSold = data.reduce((s, r) => s + toCompanyAmount(r, Number(r.sale_order.total) || 0, currency), 0);
  const totalPaid = data.reduce((s, r) => s + toCompanyAmount(r, r.total_paid || 0, currency), 0);
  const totalPending = data.reduce((s, r) => s + toCompanyAmount(r, r.total_pending || 0, currency), 0);

  const summaryY = filterY + 16;
  const colW = (PAGE_W - MARGIN * 2) / 3;
  const summaryCols: [string, number, [number, number, number]][] = [
    ["VENDIDO", totalSold, INK],
    ["PAGADO", totalPaid, [22, 163, 74]],
    ["PENDIENTE", totalPending, [220, 38, 38]],
  ];
  summaryCols.forEach(([label, amount, color], i) => {
    const x = MARGIN + colW * i;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...INK_MID);
    doc.text(label, x, summaryY, { align: i === 0 ? "left" : i === 2 ? "right" : "center" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...color);
    doc.text(
      `${formatAmount(amount)} ${currency}`,
      x,
      summaryY + 8,
      { align: i === 0 ? "left" : i === 2 ? "right" : "center" }
    );
  });

  drawRule(doc, summaryY + 14);

  autoTable(doc, {
    head: [["Código", "Fecha", "Cliente", "Vendido", "Pagado", "Pendiente"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((r) => [
      r.sale_order.code,
      new Date(Number(r.sale_order.date)).toLocaleDateString("es-ES"),
      r.sale_order.client?.fullName || "-",
      formatAmount(toCompanyAmount(r, Number(r.sale_order.total || 0), currency)),
      formatAmount(toCompanyAmount(r, r.total_paid || 0, currency)),
      formatAmount(toCompanyAmount(r, r.total_pending || 0, currency)),
    ]),
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: summaryY + 20,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 26, halign: "center" },
      1: { cellWidth: 22, halign: "center" },
      2: { cellWidth: 58 },
      3: { cellWidth: 24, halign: "right" },
      4: { cellWidth: 24, halign: "right", textColor: [22, 163, 74] },
      5: { cellWidth: 28, halign: "right", textColor: [220, 38, 38], fontStyle: "bold" },
    },
    margin: { left: MARGIN, right: MARGIN },
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
