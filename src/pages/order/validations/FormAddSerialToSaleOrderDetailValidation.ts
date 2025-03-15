import { object, string } from "yup";

export const schemaFormAddSerialToSaleOrderDetail = object().shape({
  serial: string().required("El serial es requerido"),
});
