import { object, string } from "yup";

export const schemaLogin = object().shape({
  user_name: string().required("Usuario requerido"),
  password: string().required("Contraseña requerida"),
});
