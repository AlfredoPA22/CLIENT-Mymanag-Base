export const salePaymentMethodOptions = [
  { label: "Efectivo", value: "Efectivo" },
  { label: "QR", value: "QR" },
  { label: "Transferencia", value: "Transferencia" },
];

// Cuando el cobro por QR no está configurado en el servidor (faltan las
// llaves de Mesa de Pagos), la opción sigue visible pero deshabilitada —
// así el usuario ve que existe sin poder elegirla, en vez de que
// desaparezca o falle recién al intentar generar el QR.
export const getSalePaymentMethodOptions = (qrAvailable: boolean) =>
  salePaymentMethodOptions.map((option) =>
    option.value === "QR"
      ? { ...option, label: qrAvailable ? option.label : "QR (Próximamente)", disabled: !qrAvailable }
      : option
  );
