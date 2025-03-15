import { object, string } from "yup";

export const schemaFormAddSerialToPurchaseOrderDetail = object().shape({
  serial: string().required("El serial es requerido"),
});
