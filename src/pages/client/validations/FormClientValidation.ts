import { object, string } from "yup";

export const schemaFormClient = object().shape({
  fullName: string().required("El nombre del cliente es requerido"),
  phoneNumber:string(),
  email:string(),
  address:string(),
});
