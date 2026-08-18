import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatAmount, round2 } from "../../../utils/currency";

// ── Design tokens — sober, white-based (mismos que generateSaleOrderReportPDF) ───
const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const TABLE_HEAD: [number, number, number] = [241, 245, 249];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const ACCENT: [number, number, number] = [160, 200, 46];
const RED: [number, number, number] = [180, 0, 0];

const PAGE_W = 210;
const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
};

interface ICashRegisterRow {
  _id: string;
  status: string;
  opening_amount: number;
  opening_amount_bs?: number | null;
  opening_date: string;
  opened_by?: { user_name: string } | null;
  closing_amount?: number | null;
  closing_amount_bs?: number | null;
  closing_date?: string | null;
  closed_by?: { user_name: string } | null;
  expected_amount?: number;
  expected_amount_bs?: number;
}

interface CashRegisterReportFilters {
  userLabel?: string;
  status?: string;
  startDate?: Date | null;
  endDate?: Date | null;
}

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const n = Number(value);
  const date = !isNaN(n) ? new Date(n) : new Date(value);
  return date.toLocaleDateString("es-ES");
};

// Combina moneda base + Bs en una sola celda — la mayoría de las cajas solo
// maneja la moneda base; agregar la de Bs solo cuando de verdad se usó evita
// una columna aparte vacía en casi todas las filas.
const formatDual = (mainVal: number | null | undefined, currency: string, bsVal?: number | null) => {
  const main = `${formatAmount(mainVal ?? 0)} ${currency}`;
  if (!bsVal) return main;
  return `${main} + ${formatAmount(bsVal)} Bs`;
};

export const generateCashRegisterReportPDF = (
  data: ICashRegisterRow[],
  currency: string,
  filters: CashRegisterReportFilters
) => {
  const doc = new jsPDF({ orientation: "portrait" });

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE BLOCK ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE CAJA", MARGIN, 16);

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

  // ── FILTROS + RESUMEN ─────────────────────────────────────
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
    `Usuario: ${filters.userLabel || "Todos"}     Estado: ${filters.status || "Todos"}`,
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

  // Cajas cerradas con una diferencia real (esperado ≠ contado) — lo primero
  // que un admin quiere ver de un histórico de arqueos es cuántos cuadraron mal.
  const closed = data.filter((r) => r.closing_amount != null);
  const withDifference = closed.filter((r) => {
    const diff = round2((r.closing_amount ?? 0) - (r.expected_amount ?? 0));
    const diffBs = round2((r.closing_amount_bs ?? 0) - (r.expected_amount_bs ?? 0));
    return diff !== 0 || diffBs !== 0;
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("CON DIFERENCIA", PAGE_W - MARGIN, filterY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...(withDifference.length > 0 ? RED : INK));
  doc.text(`${withDifference.length} de ${closed.length} cerradas`, PAGE_W - MARGIN, filterY + 9, { align: "right" });

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, filterY + 16);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Apertura", "Abierto por", "Cierre", "Cerrado por", "Esperado", "Contado", "Diferencia", "Estado"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 4, right: 2, bottom: 4, left: 2 },
    },
    body: data.map((r) => {
      const isClosed = r.closing_amount != null;
      const diff = isClosed ? round2((r.closing_amount ?? 0) - (r.expected_amount ?? 0)) : null;
      const diffBs = isClosed ? round2((r.closing_amount_bs ?? 0) - (r.expected_amount_bs ?? 0)) : null;
      const hasDiff = diff !== null && (diff !== 0 || diffBs !== 0);

      return [
        formatDate(r.opening_date),
        r.opened_by?.user_name ?? "—",
        isClosed ? formatDate(r.closing_date) : "—",
        r.closed_by?.user_name ?? "—",
        formatDual(r.expected_amount, currency, r.expected_amount_bs),
        isClosed ? formatDual(r.closing_amount, currency, r.closing_amount_bs) : "—",
        {
          content: isClosed ? formatDual(diff, currency, diffBs) : "—",
          styles: hasDiff ? { textColor: RED, fontStyle: "bold" as const } : {},
        },
        r.status === "ABIERTA" ? "Abierta" : "Cerrada",
      ];
    }),
    bodyStyles: { fontSize: 7.5, textColor: INK, cellPadding: 3, halign: "center" },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: filterY + 24,
    theme: "plain",
    columnStyles: {
      1: { halign: "left" },
      3: { halign: "left" },
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
  doc.text("Inventasys — Reporte de Caja", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save("reporte_caja.pdf");
};
