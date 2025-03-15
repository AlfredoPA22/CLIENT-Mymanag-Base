import { number, object, string } from "yup";

export const schemaFormProduct = object().shape({
  name: string().required("El nombre del producto es requerido"),
  code: string(),
  description: string(),
  category: string().required("Seleccione una categoria"),
  brand: string().required("Seleccione una marca"),
  stock_type: string().required("Seleccione un tipo de stock"),
  sale_price: number().required("El precio del producto es requerido"),
});
