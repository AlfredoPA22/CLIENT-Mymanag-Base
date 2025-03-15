import { object, string } from "yup";

export const schemaFormPurchaseOrder = object().shape({
  date: string().required("La fecha de la orden es requerida"),
  provider: string().required("El proveedor es requerido"),
});
