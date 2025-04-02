import { object, string } from "yup";

export const schemaFormRole = object().shape({
  name: string().required("El nombre del Rol es requerido"),
  description: string(),
});
