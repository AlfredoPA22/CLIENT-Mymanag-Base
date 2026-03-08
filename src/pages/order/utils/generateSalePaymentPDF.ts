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
const ACCENT: [number, number, number] = [160, 200, 46];

const PAGE_W = 210;
const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
};

export const generatePDF = (
  data: ISalePayment,
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
  doc.text("COMPROBANTE DE PAGO", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MID);
  doc.text(`N° ${detail.sale_order.code}`, MARGIN, 23);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `Registrado por: ${data.created_by.user_name}   ·   ${getDate(data.date)}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, 28);

  // ── INFO FIELDS ──────────────────────────────────────────
  const col2X = PAGE_W / 2 + 5;
  const infoY = 34;

  // Left
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("CLIENTE", MARGIN, infoY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(data.sale_order.client.fullName, MARGIN, infoY + 6, { maxWidth: col2X - MARGIN - 4 });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("TOTAL DE VENTA", MARGIN, infoY + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`${detail.total_amount} ${currency}`, MARGIN, infoY + 21);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("SALDO RESTANTE", MARGIN, infoY + 28);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(`${detail.total_pending} ${currency}`, MARGIN, infoY + 34);

  // Right — highlight paid amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("MONTO PAGADO", col2X, infoY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(`${data.amount} ${currency}`, col2X, infoY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_MID);
  doc.text(`Método: ${data.payment_method}`, col2X, infoY + 20);
  doc.text(`Fecha: ${getDate(data.date)}`, col2X, infoY + 26);

  // ── RULE ──────────────────────────────────────────────────
  drawRule(doc, infoY + 40);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Fecha de Pago", "Nota", "Método de Pago", "Monto"]],
    body: [
      [
        getDate(data.date),
        data.note || "—",
        data.payment_method,
        `${data.amount} ${currency}`,
      ],
    ],
    startY: infoY + 46,
    theme: "plain",
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
    },
    bodyStyles: { fontSize: 9, textColor: INK, cellPadding: 5 },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── PAGE FOOTER ───────────────────────────────────────────
  drawRule(doc, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    MARGIN,
    287
  );
  doc.text("Documento no fiscal", PAGE_W / 2, 287, { align: "center" });
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save(`comprobante_pago_${detail.sale_order.code}.pdf`);
};
