import { object, string } from "yup";

export const schemaFormWarehouse = object().shape({
  name: string().required("El nombre del almacén es requerido"),
  description: string(),
});
