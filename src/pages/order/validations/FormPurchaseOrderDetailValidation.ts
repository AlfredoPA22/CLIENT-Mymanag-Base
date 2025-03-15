import { number, object, string } from "yup";

export const schemaFormPurchaseOrderDetail = object().shape({
  product: string().required("El producto es requerido"),
  purchase_order: string().required("la orden es requerida"),
  purchase_price: number()
    .positive("El precio debe ser mayor a 0")
    .required("El precio de compra es requerido"),
  quantity: number()
    .positive("La cantidad debe ser mayor a 0")
    .integer("La cantidad debe ser un numero entero")
    .required("La cantidad es requerida"),
});
