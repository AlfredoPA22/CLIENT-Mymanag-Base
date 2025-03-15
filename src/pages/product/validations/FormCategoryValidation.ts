import { object, string } from "yup";

export const schemaFormCategory = object().shape({
  name: string().required("El nombre de la categoria es requerido"),
  description: string(),
});
