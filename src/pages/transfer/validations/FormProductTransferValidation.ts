import { object, string } from "yup";

export const schemaFormProductTransfer = object().shape({
  origin_warehouse: string().required("El almacén de origen es requerido"),
  destination_warehouse: string().required(
    "El almacén de destino es requerido"
  ),
});
