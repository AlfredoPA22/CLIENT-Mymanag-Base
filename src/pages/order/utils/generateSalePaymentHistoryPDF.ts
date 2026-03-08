import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IDetailSalePayment,
  ISalePayment,
} from "../../../utils/interfaces/SalePayment";
import { getDate } from "./getDate";

// ── Design tokens — sober, white-based ───────────────────────
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

export const generateHistoryPDF = (
  data: ISalePayment[],
  currency: string,
  detail: IDetailSalePayment
) => {
  const doc = new jsPDF();

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── TITLE BLOCK ───────────────────────────────────────────
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("HISTORIAL DE PAGOS", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MID);
  doc.text(`N° ${detail.sale_order.code}`, MARGIN, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, 28);

  // ── SUMMARY FIELDS ───────────────────────────────────────
  const infoY = 34;
  const colW = (PAGE_W - MARGIN * 2) / 3;

  const summaryItems = [
    { label: "CLIENTE", value: detail.sale_order.client.fullName },
    { label: "TOTAL DE VENTA", value: `${detail.total_amount} ${currency}` },
    { label: "TOTAL PAGADO", value: `${detail.total_paid} ${currency}` },
  ];

  summaryItems.forEach((item, i) => {
    const x = MARGIN + i * colW;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(...INK_MID);
    doc.text(item.label, x, infoY);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(item.value, x, infoY + 6, { maxWidth: colW - 4 });
  });

  // Saldo restante — right-aligned, slightly larger
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("SALDO RESTANTE", PAGE_W - MARGIN, infoY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...INK);
  doc.text(`${detail.total_pending} ${currency}`, PAGE_W - MARGIN, infoY + 8, { align: "right" });

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, infoY + 18);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Fecha", "Nota", "Método de Pago", `Monto (${currency})`, "Registrado por"]],
    body: data.map((payment) => [
      getDate(payment.date),
      payment.note || "—",
      payment.payment_method,
      payment.amount,
      payment.created_by.user_name,
    ]),
    startY: infoY + 24,
    theme: "plain",
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    columnStyles: {
      0: { cellWidth: 30, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 38, halign: "center" },
      3: { cellWidth: 30, halign: "right" },
      4: { cellWidth: 34 },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── TOTAL ─────────────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 4;
  drawRule(doc, finalY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(
    `TOTAL PAGADO:   ${detail.total_paid} ${currency}`,
    PAGE_W - MARGIN,
    finalY + 8,
    { align: "right" }
  );

  // ── PAGE FOOTER ───────────────────────────────────────────
  drawRule(doc, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Documento no fiscal", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save(`historial_pagos_${detail.sale_order.code}.pdf`);
};
