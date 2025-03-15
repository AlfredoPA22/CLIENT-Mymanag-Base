import { object, string } from "yup";

export const schemaFormSaleOrder = object().shape({
  date: string().required("La fecha de la orden es requerida"),
  client: string().required("El cliente es requerido"),
});
