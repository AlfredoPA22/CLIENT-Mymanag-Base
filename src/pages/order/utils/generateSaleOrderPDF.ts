import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ICompany } from "../../../utils/interfaces/Company";
import { ISaleOrderToPDF } from "../../../utils/interfaces/SaleOrder";
import { getDate } from "./getDate";

export const generatePDF = async (
  data: ISaleOrderToPDF,
  dataCompany: ICompany,
  currency: string
) => {
  const toBase64 = (url: string): Promise<string> =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  const doc = new jsPDF();

  const defaultLogo: string =
    "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462281/Logo_Inventasys_1_tp7nlz.png";

  const logoUrl: string =
    dataCompany.image && dataCompany.image.trim() !== ""
      ? dataCompany.image
      : defaultLogo;

  try {
    const imgData = await toBase64(logoUrl);
    // (x, y, width, height)
    doc.addImage(imgData, "JPEG", 14, 10, 25, 25);
  } catch (error) {
    console.warn("⚠️ No se pudo cargar el logo:", error);
  }

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
doc.text(`Código: ${data.saleOrder.code}`, 14, 45);
doc.text(`Cliente: ${data.saleOrder.client.fullName}`, 14, 55);
doc.text(`Total: ${data.saleOrder.total} ${currency}`, 14, 65);
doc.text(`Fecha: ${getDate(data.saleOrder.date)}`, 150, 45);
doc.text(`Estado: ${data.saleOrder.status}`, 150, 55);


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
      `${detail.saleOrderDetail.sale_price} ${currency}`,
      `${detail.saleOrderDetail.subtotal} ${currency}`,
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
    body: rows,
    startY: 80,
    theme: "plain",
    styles: {
      lineWidth: 0,
      lineColor: [0, 0, 0],
    },
    tableLineWidth: 0.4,
    tableLineColor: [45, 102, 234],
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
  doc.save(`${data.saleOrder.code}.pdf`);
};
