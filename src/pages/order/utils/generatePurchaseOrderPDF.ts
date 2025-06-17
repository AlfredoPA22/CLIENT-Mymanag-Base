import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IPurchaseOrderToPDF } from "../../../utils/interfaces/PurchaseOrder";
import { getDate } from "./getDate";
import useAuth from "../../auth/hooks/useAuth";

export const generatePDF = (data: IPurchaseOrderToPDF) => {
  const { currency } = useAuth();
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(18);
  doc.text("Orden de Compra", 75, 20);

  // Datos de la orden de compra
  doc.setFontSize(12);
  doc.text(`Código: ${data.purchaseOrder.code}`, 14, 30);
  doc.text(`Proveedor: ${data.purchaseOrder.provider.name}`, 14, 35);
  doc.text(`Total: ${data.purchaseOrder.total} ${currency}`, 14, 40);
  doc.text(`Fecha: ${getDate(data.purchaseOrder.date)}`, 150, 30);
  doc.text(`Estado: ${data.purchaseOrder.status}`, 150, 35);

  // Cabeceras para la tabla
  const columns = [
    { title: "Código de Producto" },
    { title: "Nombre de Producto" },
    { title: "Marca" },
    { title: "Cantidad" },
    { title: "Precio compra" },
    { title: "Subtotal" },
    { title: "Seriales" },
  ];

  // Datos para la tabla
  const rows = data.purchaseOrderDetail.map((detail) => [
    detail.purchaseOrderDetail.product.code,
    detail.purchaseOrderDetail.product.name,
    detail.purchaseOrderDetail.product.brand.name,
    detail.purchaseOrderDetail.quantity,
    `${detail.purchaseOrderDetail.purchase_price} ${currency}`,
    `${detail.purchaseOrderDetail.subtotal} ${currency}`,
    detail.productSerial.map((serial) => serial.serial).join(", "),
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
      1: { cellWidth: 45 },
      2: { cellWidth: 20 },
      3: { cellWidth: 20 },
      4: { cellWidth: 20 },
      5: { cellWidth: 20 },
      6: { cellWidth: 35 },
    },
  });

  // Guardar el PDF
  doc.save(`${data.purchaseOrder.code}.pdf`);
};
