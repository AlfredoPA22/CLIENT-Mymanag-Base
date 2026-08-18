import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICommission } from "../../../utils/interfaces/Commission";
import { ICompany } from "../../../utils/interfaces/Company";
import { getDate } from "../../order/utils/getDate";
import { formatAmount } from "../../../utils/currency";

// Mismos tokens de diseño que generateProductTransferPDF.ts/generateSaleOrderPDF.ts
const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const TABLE_HEAD: [number, number, number] = [241, 245, 249];
const ACCENT: [number, number, number] = [160, 200, 46];

const PAGE_W = 210;
const MARGIN = 14;

const DEFAULT_LOGO =
  "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462281/Logo_Inventasys_1_tp7nlz.png";

const toBase64 = (url: string): Promise<string> =>
  fetch(url)
    .then((res) => res.blob())
    .then(
      (blob) =>
        new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
    );

const drawRule = (doc: jsPDF, y: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
};

export const generateCommissionPDF = async (
  commission: ICommission,
  currency: string,
  dataCompany: ICompany
) => {
  const doc = new jsPDF();
  const saleOrder = commission.sale_order;

  // ── TOP ACCENT LINE ───────────────────────────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── HEADER (white) ────────────────────────────────────────
  const logoUrl = dataCompany?.image?.trim() ? dataCompany.image : DEFAULT_LOGO;
  try {
    const imgData = await toBase64(logoUrl);
    doc.addImage(imgData, "JPEG", MARGIN, 7, 24, 24);
  } catch { /* sin logo */ }

  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(dataCompany?.name || dataCompany?.legal_name || "Mi Empresa", 42, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...INK_LIGHT);
  const companyLines = [
    dataCompany?.nit ? `NIT: ${dataCompany.nit}` : "",
    dataCompany?.address || "",
    [dataCompany?.phone, dataCompany?.email].filter(Boolean).join("   ·   "),
  ].filter(Boolean);
  companyLines.forEach((line, i) => doc.text(line, 42, 19 + i * 4.8));

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("COMPROBANTE DE COMISIÓN", PAGE_W - MARGIN, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MID);
  doc.text(`Venta N° ${saleOrder ? saleOrder.code : "—"}`, PAGE_W - MARGIN, 22, { align: "right" });
  doc.text(`Fecha: ${getDate(commission.createdAt) ?? "—"}`, PAGE_W - MARGIN, 28, { align: "right" });

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, 35);

  // ── INFO FIELDS ──────────────────────────────────────────
  const col2X = PAGE_W / 2 + 5;
  const infoY = 41;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("VENDEDOR", MARGIN, infoY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(commission.seller?.user_name ?? "—", MARGIN, infoY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("CLIENTE", MARGIN, infoY + 15);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(saleOrder ? saleOrder.client?.fullName ?? "—" : "Venta eliminada", MARGIN, infoY + 21, {
    maxWidth: col2X - MARGIN - 4,
  });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("TOTAL DE VENTA", MARGIN, infoY + 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(
    saleOrder ? `${formatAmount(saleOrder.total)} ${saleOrder.currency ?? currency}` : "—",
    MARGIN,
    infoY + 36
  );

  // Right — highlight commission amount
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("MONTO DE COMISIÓN", col2X, infoY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...INK);
  doc.text(`${formatAmount(commission.amount)} ${currency}`, col2X, infoY + 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_MID);
  doc.text(`Tasa aplicada: ${commission.rate}%`, col2X, infoY + 20);
  doc.text(`Estado: ${commission.status}`, col2X, infoY + 26);
  if (commission.paid_at) {
    doc.text(`Pagada: ${getDate(commission.paid_at)}`, col2X, infoY + 32);
    if (commission.paid_by) {
      doc.text(`Pagado por: ${commission.paid_by.user_name}`, col2X, infoY + 38);
    }
  }

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, infoY + 46);

  // ── TABLE ────────────────────────────────────────────────
  autoTable(doc, {
    head: [["Venta", "Fecha", "Total venta", "Tasa", "Comisión", "Estado"]],
    body: [
      [
        saleOrder ? saleOrder.code : "Venta eliminada",
        getDate(commission.createdAt) ?? "—",
        saleOrder ? `${formatAmount(saleOrder.total)} ${saleOrder.currency ?? currency}` : "—",
        `${commission.rate}%`,
        `${formatAmount(commission.amount)} ${currency}`,
        commission.status,
      ],
    ],
    startY: infoY + 52,
    theme: "plain",
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
    },
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 5, halign: "center" },
    margin: { left: MARGIN, right: MARGIN },
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

  doc.save(`comision_${saleOrder ? saleOrder.code : commission._id}.pdf`);
};
