import { object, string } from "yup";

export const schemaFormSearchProduct = object().shape({
  serial: string().required("El argumento es requerido"),
});
