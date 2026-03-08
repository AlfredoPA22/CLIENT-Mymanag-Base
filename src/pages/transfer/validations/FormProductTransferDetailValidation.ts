import { number, object, string } from "yup";

export const schemaFormProductTransferDetail = object().shape({
  product: string().required("El producto es requerido"),
  product_transfer: string().required("La transferencia es requerida"),
  quantity: number()
    .positive("La cantidad debe ser mayor a 0")
    .integer("La cantidad debe ser un número entero")
    .required("La cantidad es requerida"),
});
