import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICompany } from "../../../utils/interfaces/Company";
import { ISaleOrderToPDF } from "../../../utils/interfaces/SaleOrder";
import { getDate } from "./getDate";
import { buildSerialsRows, drawPaginatedFooter, withBottomRule } from "./pdfSerialsGrid";
import { formatAmount } from "../../../utils/currency";

// ── Design tokens — sober, white-based ───────────────────────
const INK: [number, number, number] = [30, 41, 59];        // slate-800 — main text
const INK_MID: [number, number, number] = [71, 85, 105];   // slate-600 — labels
const INK_LIGHT: [number, number, number] = [148, 163, 184]; // slate-400 — secondary
const RULE: [number, number, number] = [203, 213, 225];    // slate-300 — lines
const TABLE_HEAD: [number, number, number] = [241, 245, 249]; // slate-100 — table header bg
const ACCENT: [number, number, number] = [160, 200, 46];   // brand green — top rule only
const RED: [number, number, number] = [180, 0, 0];         // discount — red

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

export const generatePDF = async (
  data: ISaleOrderToPDF,
  dataCompany: ICompany,
  currency: string
) => {
  const doc = new jsPDF();

  // ── TOP ACCENT LINE (brand green, 3px) ───────────────────
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  // ── HEADER (white background) ────────────────────────────
  // Logo — on white, clearly visible
  const logoUrl = dataCompany?.image?.trim() ? dataCompany.image : DEFAULT_LOGO;
  try {
    const imgData = await toBase64(logoUrl);
    doc.addImage(imgData, "JPEG", MARGIN, 7, 24, 24);
  } catch { /* sin logo */ }

  // Company name
  doc.setTextColor(...INK);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10.5);
  doc.text(
    dataCompany?.name || dataCompany?.legal_name || "Mi Empresa",
    42,
    13
  );

  // Company details
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...INK_LIGHT);
  const companyLines = [
    dataCompany?.nit ? `NIT: ${dataCompany.nit}` : "",
    dataCompany?.address || "",
    [dataCompany?.phone, dataCompany?.email].filter(Boolean).join("   ·   "),
  ].filter(Boolean);
  companyLines.forEach((line, i) => doc.text(line, 42, 19 + i * 4.8));

  // Document title (right side — dark text on white)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("ORDEN DE VENTA", PAGE_W - MARGIN, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MID);
  doc.text(`N° ${data.saleOrder.code}`, PAGE_W - MARGIN, 22, { align: "right" });
  doc.text(`Fecha: ${getDate(data.saleOrder.date) ?? "—"}`, PAGE_W - MARGIN, 28, { align: "right" });

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, 35);

  // ── INFO FIELDS ──────────────────────────────────────────
  const infoY = 40;
  const COL2 = 90;
  const COL3 = 148;

  const paymentDisplay =
    data.saleOrder.payment_method === "Contado"
      ? `${data.saleOrder.payment_method}  ·  ${data.saleOrder.contado_payment_method ?? "—"}`
      : data.saleOrder.payment_method ?? "—";

  const discountAmount = Number(data.saleOrder.discount_amount) || 0;
  const hasDiscount = discountAmount > 0;
  const subtotalBruto = data.saleOrder.total + discountAmount;

  // Labels row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("CLIENTE", MARGIN, infoY);
  doc.text("ESTADO", COL2, infoY);
  doc.text("MÉTODO DE PAGO", COL3, infoY);

  // Values row
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(data.saleOrder.client.fullName, MARGIN, infoY + 6);
  doc.text(data.saleOrder.status, COL2, infoY + 6);
  doc.text(paymentDisplay, COL3, infoY + 6);

  // Client sub-info (code + phone)
  const subInfo = [
    data.saleOrder.client.code ? `Cód: ${data.saleOrder.client.code}` : "",
    data.saleOrder.client.phoneNumber ? `Tel: ${data.saleOrder.client.phoneNumber}` : "",
  ].filter(Boolean).join("   ·   ");

  if (subInfo) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(...INK_LIGHT);
    doc.text(subInfo, MARGIN, infoY + 13);
  }

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, infoY + 20);

  // ── TABLE ────────────────────────────────────────────────
  const columns = [
    "Código",
    "Producto",
    "Marca",
    "Cant.",
    `P. Venta (${currency})`,
    `Subtotal (${currency})`,
  ];

  const rows = data.saleOrderDetail.flatMap((detail) => {
    const d = detail.saleOrderDetail;
    const detailDiscount = Number(d.discount_amount) || 0;

    const mainRow = [
      d.product.code,
      d.product.name,
      d.product.brand.name,
      d.quantity,
      formatAmount(d.sale_price),
      formatAmount(d.subtotal),
    ];

    const extraRows: any[] = [];

    if (detailDiscount > 0) {
      const label =
        d.discount_type === "percentage"
          ? `Descuento (${d.discount_value}%): -${formatAmount(detailDiscount)} ${currency}`
          : `Descuento: -${formatAmount(detailDiscount)} ${currency}`;
      extraRows.push([
        {
          content: label,
          colSpan: 6,
          styles: {
            fillColor: [255, 245, 245] as [number, number, number],
            textColor: RED,
            fontSize: 6.5,
            fontStyle: "italic" as const,
            cellPadding: { top: 2, right: 4, bottom: 2, left: 8 },
          },
        },
      ]);
    }

    const serials = detail.productSerial.map((s) => s.serial);
    extraRows.push(...buildSerialsRows(serials, 6, PAGE_W - 2 * MARGIN));

    const block = [mainRow, ...extraRows];
    block[block.length - 1] = withBottomRule(block[block.length - 1]);
    return block;
  });

  autoTable(doc, {
    head: [columns],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      lineWidth: { top: 0, right: 0, bottom: 0.3, left: 0 },
      lineColor: RULE,
    },
    body: rows,
    bodyStyles: { fontSize: 8, textColor: INK, cellPadding: 3 },
    startY: infoY + 25,
    theme: "plain",
    rowPageBreak: "avoid",
    columnStyles: {
      0: { cellWidth: 24, halign: "center" },
      1: { cellWidth: 60 },
      2: { cellWidth: 26 },
      3: { cellWidth: 14, halign: "center" },
      4: { cellWidth: 30, halign: "right" },
      5: { cellWidth: 28, halign: "right" },
    },
    margin: { left: MARGIN, right: MARGIN },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── TOTAL FOOTER ─────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 4;
  drawRule(doc, finalY);

  if (hasDiscount) {
    const discountFooterLabel =
      data.saleOrder.discount_type === "percentage"
        ? `Descuento (${data.saleOrder.discount_value}%):`
        : "Descuento:";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(...INK_MID);
    doc.text(
      `Subtotal:   ${formatAmount(subtotalBruto)} ${currency}`,
      PAGE_W - MARGIN,
      finalY + 6,
      { align: "right" }
    );
    doc.setTextColor(...RED);
    doc.text(
      `${discountFooterLabel}   -${formatAmount(discountAmount)} ${currency}`,
      PAGE_W - MARGIN,
      finalY + 12,
      { align: "right" }
    );
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(
      `TOTAL:   ${formatAmount(data.saleOrder.total)} ${currency}`,
      PAGE_W - MARGIN,
      finalY + 20,
      { align: "right" }
    );
  } else {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(
      `TOTAL:   ${formatAmount(data.saleOrder.total)} ${currency}`,
      PAGE_W - MARGIN,
      finalY + 8,
      { align: "right" }
    );
  }

  // ── PAGE FOOTER (numeración real, se repite en cada página) ──
  drawPaginatedFooter(doc, drawRule, INK_LIGHT, MARGIN, PAGE_W);

  doc.save(`${data.saleOrder.code}.pdf`);
};
