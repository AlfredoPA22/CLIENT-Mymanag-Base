import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IFilterProductInput,
  IProduct,
} from "../../../utils/interfaces/Product";

export const generateProductReportPDF = (
  data: IProduct[],
  currency: string,
  filters: IFilterProductInput
) => {
  const doc = new jsPDF({ orientation: "landscape" });

  // Título
  doc.setFontSize(24);
  doc.setTextColor("#2d66ea");
  doc.setFont("helvetica", "bold");
  doc.text("Reporte de Productos", 120, 20);

  // Filtros aplicados
  doc.setFontSize(12);
  doc.setTextColor("#000");
  doc.setFont("helvetica", "normal");

  // Primera fila: Categoría y Estado
  const filterText1 = `Categoría: ${
    filters.category ? filters.category : "Todas"
  }`;
  const filterText2 = `Estado: ${filters.status ? filters.status : "Todos"}`;

  doc.text(filterText1, 14, 30);
  doc.text(filterText2, 250, 30); // al otro extremo en landscape (aprox)

  // Segunda fila: Marca
  const filterText3 = `Marca: ${filters.brand ? filters.brand : "Todas"}`;
  doc.text(filterText3, 14, 37);

  // Tabla de productos
  const columns = [
    { title: "Código" },
    { title: "Producto" },
    { title: "Categoría" },
    { title: "Marca" },
    { title: "Precio Venta" },
    { title: "Stock" },
    { title: "Estado" },
  ];

  const rows = data.map((product) => [
    product.code,
    product.name,
    product.category.name,
    product.brand.name,
    `${product.sale_price} ${currency}`,
    product.stock,
    product.status,
  ]);

  autoTable(doc, {
    head: [columns],
    headStyles: { fillColor: "#2d66ea" },
    body: rows,
    startY: 45, // un poco más abajo después de los filtros
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 60 },
      2: { cellWidth: 40 },
      3: { cellWidth: 40 },
      4: { cellWidth: 35 },
      5: { cellWidth: 25 },
      6: { cellWidth: 30 },
    },
  });

  // Guardar PDF
  doc.save("reporte_productos.pdf");
};
