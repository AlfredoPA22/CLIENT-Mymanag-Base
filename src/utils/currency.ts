// Redondea un monto a 2 decimales antes de mostrarlo o usarlo en una
// comparación — evita que restas/sumas de punto flotante en JS produzcan
// valores como 252.89999999999998 en vez de 252.9.
export const round2 = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

// Formatea un monto para mostrarlo: siempre 2 decimales fijos y separador
// de miles (1234.5 -> "1,234.50"), para que los montos grandes se lean bien.
export const formatAmount = (amount: number): string =>
  round2(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
