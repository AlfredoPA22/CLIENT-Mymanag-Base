import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IDetailSalePayment,
  ISalePayment,
} from "../../../utils/interfaces/SalePayment";
import { getDate } from "./getDate";
import useAuth from "../../auth/hooks/useAuth";

export const generatePDF = (data: ISalePayment, detail: IDetailSalePayment) => {
  const doc = new jsPDF();
  const { currency } = useAuth();

  // Título del documento
  doc.setFontSize(20);
  doc.setTextColor("#2d66ea");
  doc.setFont("helvetica", "bold");
  doc.text("Comprobante de Pago", 70, 20);

  // Datos generales de la venta
  doc.setFontSize(12);
  doc.setTextColor("#333");
  doc.setFont("helvetica", "normal");

  doc.text(`Código de Venta: ${detail.sale_order.code}`, 14, 35);
  doc.text(`Cliente: ${data.sale_order.client.fullName}`, 14, 43);
  doc.text(`Total de Venta: ${detail.total_amount} ${currency}`, 14, 51);
  doc.text(`Saldo Restante: ${detail.total_pending} ${currency}`, 14, 59);

  doc.text(`Usuario: ${data.created_by.user_name}`, 150, 35);

  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.line(14, 65, 196, 65);

  // Tabla de pago actual
  autoTable(doc, {
    head: [["Fecha de Pago", "Nota", "Método", "Monto"]],
    body: [
      [
        getDate(data.date),
        data.note || "-",
        data.payment_method,
        `${data.amount} ${currency}`,
      ],
    ],
    startY: 70,
    theme: "striped",
    headStyles: { fillColor: "#2d66ea" },
    styles: { fontSize: 10 },
  });

  doc.save(`comprobante_pago_${detail.sale_order.code}.pdf`);
};
