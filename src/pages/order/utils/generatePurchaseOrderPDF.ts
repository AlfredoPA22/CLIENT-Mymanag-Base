import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICompany } from "../../../utils/interfaces/Company";
import { IPurchaseOrderToPDF } from "../../../utils/interfaces/PurchaseOrder";
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
  data: IPurchaseOrderToPDF,
  dataCompany: ICompany,
  currency: string
) => {
  const doc = new jsPDF();

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
  doc.text(
    dataCompany?.name || dataCompany?.legal_name || "Mi Empresa",
    42,
    13
  );

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
  doc.text("ORDEN DE COMPRA", PAGE_W - MARGIN, 15, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...INK_MID);
  doc.text(`N° ${data.purchaseOrder.code}`, PAGE_W - MARGIN, 22, { align: "right" });
  doc.text(`Fecha: ${getDate(data.purchaseOrder.date) ?? "—"}`, PAGE_W - MARGIN, 28, { align: "right" });

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, 35);

  // ── INFO FIELDS ──────────────────────────────────────────
  const infoY = 40;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("PROVEEDOR", MARGIN, infoY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(data.purchaseOrder.provider.name, MARGIN, infoY + 6);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("ESTADO", MARGIN, infoY + 13);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...INK);
  doc.text(data.purchaseOrder.status, MARGIN, infoY + 19);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("TOTAL", PAGE_W - MARGIN, infoY, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...INK);
  doc.text(`${data.purchaseOrder.total} ${currency}`, PAGE_W - MARGIN, infoY + 9, { align: "right" });

  // ── SECTION RULE ─────────────────────────────────────────
  drawRule(doc, infoY + 25);

  // ── TABLE ────────────────────────────────────────────────
  const columns = [
    "Código",
    "Producto",
    "Marca",
    "Cant.",
    `P. Compra (${currency})`,
    `Subtotal (${currency})`,
    "Seriales",
  ];

  const rows = data.purchaseOrderDetail.map((detail) => [
    detail.purchaseOrderDetail.product.code,
    detail.purchaseOrderDetail.product.name,
    detail.purchaseOrderDetail.product.brand.name,
    detail.purchaseOrderDetail.quantity,
    detail.purchaseOrderDetail.purchase_price,
    detail.purchaseOrderDetail.subtotal,
    detail.productSerial.map((s) => s.serial).join("   ·   ") || "—",
  ]);

  autoTable(doc, {
    head: [columns],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 7.5,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: rows,
    bodyStyles: { fontSize: 8, textColor: INK, cellPadding: 3 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: infoY + 30,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      1: { cellWidth: 46 },
      2: { cellWidth: 20 },
      3: { cellWidth: 12, halign: "center" },
      4: { cellWidth: 26, halign: "right" },
      5: { cellWidth: 24, halign: "right" },
      6: { cellWidth: 32 },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  // ── TOTAL FOOTER ─────────────────────────────────────────
  const finalY = (doc as any).lastAutoTable.finalY + 4;
  drawRule(doc, finalY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.setTextColor(...INK);
  doc.text(
    `TOTAL:   ${data.purchaseOrder.total} ${currency}`,
    PAGE_W - MARGIN,
    finalY + 8,
    { align: "right" }
  );

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
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save(`${data.purchaseOrder.code}.pdf`);
};
