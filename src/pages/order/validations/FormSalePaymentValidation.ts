import { number, object, string } from "yup";

export const schemaFormSalePayment = object().shape({
  date: string().required("La fecha del pago es requerida"),
  amount: number()
    .required("El monto es requerido")
    .moreThan(0, "El monto debe ser mayor a cero"),
});
