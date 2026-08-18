import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICommission } from "../../../utils/interfaces/Commission";
import { commissionStatus } from "../../../utils/enums/commissionStatus.enum";
import { formatAmount } from "../../../utils/currency";

// ── Design tokens — sober, white-based (mismos que generateSaleOrderReportPDF) ───
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

interface CommissionReportFilters {
  sellerLabel?: string;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const generateCommissionReportPDF = (
  data: ICommission[],
  currency: string,
  filters: CommissionReportFilters
) => {
  const doc = new jsPDF({ orientation: "portrait" });

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE BLOCK ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE COMISIONES", MARGIN, 16);

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
  drawRule(doc, 22);

  // ── FILTER + SUMMARY ROW ─────────────────────────────────
  const filterY = 28;

  // Left: filtros
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("FILTROS", MARGIN, filterY);
  doc.text("PERÍODO", MARGIN, filterY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(
    `Vendedor: ${filters.sellerLabel || "Todos"}     Estado: ${filters.status || "Todos"}`,
    MARGIN + 18,
    filterY
  );
  const desde = filters.startDate
    ? new Date(filters.startDate).toLocaleDateString("es-ES")
    : "Sin filtro";
  const hasta = filters.endDate
    ? new Date(filters.endDate).toLocaleDateString("es-ES")
    : "Sin filtro";
  doc.text(`${desde}  —  ${hasta}`, MARGIN + 18, filterY + 9);

  // Right: total pendiente + total pagado
  const totalPending = data
    .filter((c) => c.status === commissionStatus.PENDIENTE)
    .reduce((s, c) => s + c.amount, 0);
  const totalPaid = data
    .filter((c) => c.status === commissionStatus.PAGADA)
    .reduce((s, c) => s + c.amount, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("PENDIENTE", PAGE_W - MARGIN, filterY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`${formatAmount(totalPending)} ${currency}`, PAGE_W - MARGIN, filterY + 5, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("PAGADO", PAGE_W - MARGIN, filterY + 11, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(`${formatAmount(totalPaid)} ${currency}`, PAGE_W - MARGIN, filterY + 16, { align: "right" });

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, filterY + 21);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Fecha", "Vendedor", "Venta", `Total venta`, "%", `Comisión (${currency})`, "Estado"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((c) => [
      new Date(c.createdAt).toLocaleDateString("es-ES"),
      c.seller?.user_name ?? "-",
      c.sale_order ? c.sale_order.code : "Venta eliminada",
      c.sale_order
        ? `${formatAmount(c.sale_order.total)} ${c.sale_order.currency ?? currency}`
        : "-",
      `${c.rate}%`,
      formatAmount(c.amount),
      c.status,
    ]),
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 29,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      1: { cellWidth: 32 },
      2: { cellWidth: 26, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 12, halign: "center" },
      5: { cellWidth: 28, halign: "right" },
      6: { cellWidth: 22, halign: "center" },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── PAGE FOOTER ───────────────────────────────────────────
  drawRule(doc, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Reporte de Comisiones", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save("reporte_comisiones.pdf");
};
