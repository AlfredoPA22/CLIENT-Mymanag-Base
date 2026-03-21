import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IClient } from "../../../utils/interfaces/Client";

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

export const generateClientReportPDF = (data: IClient[]) => {
  const doc = new jsPDF({ orientation: "portrait" });

  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, PAGE_W, 3, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...INK);
  doc.text("REPORTE DE CLIENTES", MARGIN, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text(
    `${data.length} cliente${data.length !== 1 ? "s" : ""}   ·   Generado el ${new Date().toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" })}`,
    PAGE_W - MARGIN,
    16,
    { align: "right" }
  );

  drawRule(doc, 22);

  const infoY = 27;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(...INK_MID);
  doc.text("TOTAL CLIENTES:", MARGIN, infoY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(...INK);
  doc.text(`${data.length}`, MARGIN + 38, infoY);

  drawRule(doc, infoY + 6);

  autoTable(doc, {
    head: [["Código", "Nombre Completo", "Email", "Teléfono", "Dirección"]],
    headStyles: {
      fillColor: TABLE_HEAD,
      textColor: INK,
      fontStyle: "bold",
      fontSize: 8,
      halign: "center",
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
    },
    body: data.map((c) => [
      c.code || "-",
      c.fullName,
      c.email || "-",
      c.phoneNumber || "-",
      c.address || "-",
    ]),
    bodyStyles: { fontSize: 8, textColor: INK, cellPadding: 4 },
    alternateRowStyles: { fillColor: ROW_ALT },
    startY: infoY + 12,
    theme: "plain",
    columnStyles: {
      0: { cellWidth: 22, halign: "center" },
      1: { cellWidth: 50 },
      2: { cellWidth: 50 },
      3: { cellWidth: 30 },
      4: { cellWidth: 40 },
    },
    tableLineColor: RULE,
    tableLineWidth: 0.3,
  });

  drawRule(doc, 283);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(...INK_LIGHT);
  doc.text("Inventasys — Reporte de Clientes", MARGIN, 287);
  doc.text("Página 1 de 1", PAGE_W - MARGIN, 287, { align: "right" });

  doc.save("reporte_clientes.pdf");
};
