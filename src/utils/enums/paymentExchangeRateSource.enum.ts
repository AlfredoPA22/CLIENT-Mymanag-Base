// Qué tipo de cambio usar al convertir un pago hecho en la moneda alterna
// (Bs) — espejo del enum del backend (paymentExchangeRateSource.enum.ts).
export enum paymentExchangeRateSource {
  ACTUAL = "actual",
  NOTA = "nota",
}
