import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IFilterSaleOrderInput,
  ISaleOrder,
} from "../../../utils/interfaces/SaleOrder";

export const generateSaleOrderReportPDF = (
  data: ISaleOrder[],
  currency: string,
  filters: IFilterSaleOrderInput
) => {
  const doc = new jsPDF({ orientation: "portrait" });

  // Título principal
  doc.setFontSize(20);
  doc.setTextColor("#2d66ea");
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Ventas", 70, 20);

  // Filtros aplicados en dos líneas (izquierda y derecha)
  doc.setFontSize(12);
  doc.setTextColor("#000");
  doc.setFont("helvetica", "normal");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 30;

  // Primera línea: Proveedor - Desde
  const proveedorText = `Cliente: ${filters.client ? filters.client : "Todos"}`;
  const desdeText = `Desde: ${
    filters.startDate
      ? new Date(filters.startDate).toLocaleDateString()
      : "Sin filtro"
  }`;

  doc.text(proveedorText, margin, y);
  doc.text(desdeText, pageWidth - margin - doc.getTextWidth(desdeText), y);

  y += 7;

  // Segunda línea: Estado - Hasta
  const estadoText = `Estado: ${filters.status}`;
  const hastaText = `Hasta: ${
    filters.endDate
      ? new Date(filters.endDate).toLocaleDateString()
      : "Sin filtro"
  }`;

  doc.text(estadoText, margin, y);
  doc.text(hastaText, pageWidth - margin - doc.getTextWidth(hastaText), y);

  // Tabla
  const columns = [
    { title: "Código" },
    { title: "Fecha" },
    { title: "Cliente" },
    { title: "Estado" },
    { title: "Total" },
  ];

  const rows = data.map((order) => [
    order.code,
    new Date(Number(order.date)).toLocaleDateString(),
    order.client.fullName,
    order.status,
    `${order.total} ${currency}`,
  ]);

  autoTable(doc, {
    head: [columns],
    headStyles: { fillColor: "#2d66ea" },
    body: rows,
    startY: y + 10,
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 35 },
      2: { cellWidth: 55 },
      3: { cellWidth: 30 },
      4: { cellWidth: 30 },
    },
  });

  doc.save("reporte_ventas.pdf");
};
