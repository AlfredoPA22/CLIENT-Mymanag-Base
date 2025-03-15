import { object, string } from "yup";

export const schemaFormClient = object().shape({
  firstName: string().required("El nombre del cliente es requerido"),
  lastName:string().required("El apellido del cliente es requerido"),
  phoneNumber:string(),
});
