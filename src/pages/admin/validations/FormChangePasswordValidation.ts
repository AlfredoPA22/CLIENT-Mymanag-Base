import { object, string } from "yup";

export const schemaFormChangePassword = object().shape({
  currentPassword: string().required("La contraseña actual es requerida"),
  newPassword: string().required("Ingrese la nueva contraseña"),
});
