import { object, string } from "yup";

export const schemaFormBrand = object().shape({
  name: string().required("El nombre de la marca es requerido"),
  description: string(),
});
