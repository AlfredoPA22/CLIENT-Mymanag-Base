import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { ISaleOrderToPDF } from "../../../utils/interfaces/SaleOrder";
import { getDate } from "./getDate";

export const generatePDF = (data: ISaleOrderToPDF) => {
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(24); // Título más grande
  doc.setTextColor("#2d66ea"); // Color del título (azul brillante)
  doc.setFont("helvetica", "bold"); // Fuente en negrita
  doc.text("Orden de Venta", 75, 20);

  // Espaciado y diseño para los datos de la orden de venta
  doc.setFontSize(12);
  doc.setTextColor("#333"); // Color de texto para los datos (gris oscuro)
  doc.setFont("helvetica", "normal"); // Fuente normal

  // Ajustes de los datos de la orden de venta
  doc.text(`Código: ${data.saleOrder.code}`, 14, 35);
  doc.text(`Cliente: ${data.saleOrder.client.fullName}`, 14, 45);
  doc.text(`Total: ${data.saleOrder.total} ${currencySymbol}`, 14, 55);
  doc.text(`Fecha: ${getDate(data.saleOrder.date)}`, 150, 35);
  doc.text(`Estado: ${data.saleOrder.status}`, 150, 45);

  // Cabeceras para la tabla
  const columns = [
    { title: "Código de Producto" },
    { title: "Nombre de Producto" },
    { title: "Marca" },
    { title: "Cantidad" },
    { title: "Precio venta" },
    { title: "Subtotal" },
  ];

  // Datos para la tabla
  const rows = data.saleOrderDetail.flatMap((detail) => [
    [
      detail.saleOrderDetail.product.code,
      detail.saleOrderDetail.product.name,
      detail.saleOrderDetail.product.brand.name,
      detail.saleOrderDetail.quantity,
      `${detail.saleOrderDetail.sale_price} ${currencySymbol}`,
      `${detail.saleOrderDetail.subtotal} ${currencySymbol}`,
    ],
    [
      {
        content: `Seriales: ${detail.productSerial
          .map((serial) => serial.serial)
          .join(", ")}`,
        colSpan: 6,
      },
    ],
  ]);

  // Añadir la tabla al documento
  autoTable(doc, {
    head: [columns],
    headStyles: { fillColor: "#2d66ea" },
    body: rows,
    startY: 50,
    theme: "grid",
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 55 },
      2: { cellWidth: 25 },
      3: { cellWidth: 20 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
    },
  });

  // Guardar el PDF
  doc.save("orden_de_venta.pdf");
};
