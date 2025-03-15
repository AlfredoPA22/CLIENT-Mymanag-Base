import { object, string } from "yup";

export const schemaFormProvider = object().shape({
  name: string().required("El nombre del proveedor es requerido"),
  address: string(),
  phoneNumber: string(),
});
