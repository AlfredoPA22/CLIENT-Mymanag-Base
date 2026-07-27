import { number, object, string } from "yup";

export const schemaCompanySettings = object().shape({
  legal_name: string().required("La razón social es requerida"),
  nit: string().required("El NIT / RUC es requerido"),
  email: string()
    .email("Ingresa un correo válido")
    .required("El correo de contacto es requerido"),
  phone: string().required("El teléfono es requerido"),
  address: string().required("La dirección es requerida"),
  country: string().required("Selecciona un país"),
  currency: string().required("Selecciona una moneda"),
  exchange_rate: number()
    .nullable()
    .when("currency", {
      is: "$",
      then: (schema) =>
        schema
          .required("Ingresa el tipo de cambio (Bs por $)")
          .moreThan(0, "El tipo de cambio debe ser mayor a 0"),
    }),
});
