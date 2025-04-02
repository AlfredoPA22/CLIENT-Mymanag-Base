import { object, string } from "yup";

export const schemaFormUser = object().shape({
  user_name: string().required("El usuario es requerido"),
  password: string().required("La contraseña es requerida"),
  role: string().required("El rol es requerido"),
});
