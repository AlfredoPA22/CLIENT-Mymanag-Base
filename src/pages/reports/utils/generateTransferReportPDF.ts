import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IProductTransfer } from "../../../utils/interfaces/ProductTransfer";
import { getDate } from "../../order/utils/getDate";

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

interface TransferReportFilters {
  warehouseLabel?: string;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

export const generateTransferReportPDF = (
  data: IProductTransfer[],
  filters: TransferReportFilters
) => {
  const doc = new jsPDF({ orientation: "portrait" });

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE BLOCK ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE TRANSFERENCIAS", MARGIN, 16);

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

  // ── FILTROS ───────────────────────────────────────────────
  const filterY = 28;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("FILTROS", MARGIN, filterY);
  doc.text("PERÍODO", MARGIN, filterY + 9);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK);
  doc.text(
    `Almacén: ${filters.warehouseLabel || "Todos"}     Estado: ${filters.status || "Todos"}`,
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

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, filterY + 16);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Código", "Fecha", "Origen", "Destino", "Estado", "Registrado por"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((t) => [
      t.code,
      getDate(t.date) ?? "—",
      t.origin_warehouse?.name ?? "—",
      t.destination_warehouse?.name ?? "—",
      t.status,
      t.created_by?.user_name ?? "—",
    ]),
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 24,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 24, halign: "center" },
      2: { cellWidth: 38 },
      3: { cellWidth: 38 },
      4: { cellWidth: 26, halign: "center" },
      5: { cellWidth: 28 },
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
  doc.text("Inventasys — Reporte de Transferencias", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save("reporte_transferencias.pdf");
};
