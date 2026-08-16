import { number, object, string } from "yup";

export const schemaFormUser = object().shape({
  user_name: string().required("El usuario es requerido"),
  password: string().required("La contraseña es requerida"),
  role: string().required("El rol es requerido"),
  commission_rate: number()
    .nullable()
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede superar el 100%"),
});

export const schemaFormUpdateUser = object().shape({
  user_name: string().required("El usuario es requerido"),
  role: string().required("El rol es requerido"),
  commission_rate: number()
    .nullable()
    .min(0, "La comisión no puede ser negativa")
    .max(100, "La comisión no puede superar el 100%"),
});
