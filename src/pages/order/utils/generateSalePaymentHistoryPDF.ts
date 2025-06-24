import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  IDetailSalePayment,
  ISalePayment,
} from "../../../utils/interfaces/SalePayment";
import { getDate } from "./getDate";

export const generateHistoryPDF = (
  data: ISalePayment[],
  currency: string,
  detail: IDetailSalePayment
) => {
  const doc = new jsPDF();

  // Título del documento
  doc.setFontSize(20);
  doc.setTextColor("#2d66ea");
  doc.setFont("helvetica", "bold");
  doc.text("Historial de Pagos", 70, 20);

  // Datos generales de la venta (tomamos datos de detail)
  doc.setFontSize(12);
  doc.setTextColor("#333");
  doc.setFont("helvetica", "normal");

  doc.text(`Código de Venta: ${detail.sale_order.code}`, 14, 35);
  doc.text(`Cliente: ${detail.sale_order.client.fullName}`, 14, 43);
  doc.text(`Total de Venta: ${detail.total_amount} ${currency}`, 14, 51);
  doc.text(`Total Pagado: ${detail.total_paid} ${currency}`, 14, 59);
  doc.text(`Saldo Restante: ${detail.total_pending} ${currency}`, 14, 67);

  // Línea divisoria
  doc.setLineWidth(0.5);
  doc.line(14, 73, 196, 73);

  // Tabla de historial de pagos
  autoTable(doc, {
    head: [["Fecha de Pago", "Nota", "Método", "Monto", "Usuario"]],
    body: data.map((payment) => [
      getDate(payment.date),
      payment.note || "-",
      payment.payment_method,
      `${payment.amount} ${currency}`,
      payment.created_by.user_name,
    ]),
    startY: 78,
    theme: "striped",
    headStyles: { fillColor: "#2d66ea" },
    styles: { fontSize: 10 },
  });

  doc.save(`historial_pagos_${detail.sale_order.code}.pdf`);
};
