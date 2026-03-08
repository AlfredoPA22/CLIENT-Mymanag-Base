import { object, string } from "yup";

export const schemaFormAddSerialToTransferDetail = object().shape({
  serial: string().required("El serial es requerido"),
  product_transfer_detail: string().required("El detalle es requerido"),
});
