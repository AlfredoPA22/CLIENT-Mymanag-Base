import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IProduct } from "../../../utils/interfaces/Product";

const INK: [number, number, number] = [30, 41, 59];
const INK_MID: [number, number, number] = [71, 85, 105];
const INK_LIGHT: [number, number, number] = [148, 163, 184];
const RULE: [number, number, number] = [203, 213, 225];
const TABLE_HEAD: [number, number, number] = [241, 245, 249];
const ROW_ALT: [number, number, number] = [248, 250, 252];
const ACCENT: [number, number, number] = [160, 200, 46];
const WARN: [number, number, number] = [220, 38, 38];

const MARGIN = 14;

const drawRule = (doc: jsPDF, y: number, pageW: number) => {
  doc.setDrawColor(...RULE);
  doc.setLineWidth(0.3);
  doc.line(MARGIN, y, pageW - MARGIN, y);
};

export const generateLowStockReportPDF = (data: IProduct[]) => {
  const doc = new jsPDF({ orientation: "landscape" });
  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("PRODUCTOS CON BAJO STOCK", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.length} producto${data.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  drawRule(doc, 22, PAGE_W);

  const infoY = 27;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("NOTA:", MARGIN, infoY);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK);
  doc.text("Productos cuyo stock actual es menor al mínimo configurado.", MARGIN + 14, infoY);

  drawRule(doc, infoY + 6, PAGE_W);

  // Columns total: 28+75+42+25+25+25+25 = 245 (≤ 269 available in landscape)
  autoTable(doc, {
    head: [["Código", "Producto", "Categoría", "Stock Actual", "Stock Mín.", "Stock Máx.", "A Reponer"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((p) => {
      const aReponer = Math.max(0, (p.min_stock ?? 0) - (p.stock ?? 0));
      return [
        p.code,
        p.name,
        p.category?.name || "-",
        p.stock ?? 0,
        p.min_stock ?? 0,
        p.max_stock ?? 0,
        aReponer,
      ];
    }),
    bodyStyles: { fontSize: 8.5, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: infoY + 12,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 28, halign: "center" },
      1: { cellWidth: 75 },
      2: { cellWidth: 42 },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 25, halign: "center" },
      5: { cellWidth: 25, halign: "center" },
      6: { cellWidth: 25, halign: "center", textColor: WARN, fontStyle: "bold" },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  drawRule(doc, PAGE_H - 10, PAGE_W);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Productos con Bajo Stock", MARGIN, PAGE_H - 6);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, PAGE_H - 6, { align: "right" });

  doc.save("reporte_bajo_stock.pdf");
};
