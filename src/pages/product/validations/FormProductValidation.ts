import { number, object, string } from "yup";

const minSalePriceField = {
  min_sale_price: number()
    .nullable()
    .min(0.01, "El precio mínimo debe ser mayor a 0")
    .test(
      "min-menor-igual-que-sale-price",
      "El precio mínimo no puede ser mayor al precio de venta",
      function (value) {
        const { sale_price } = this.parent;
        return value == null || sale_price === undefined || value <= sale_price;
      }
    ),
};

const storePricingFields = {
  store_price: number().nullable().min(0.01, "El precio de tienda debe ser mayor a 0"),
  store_discount_price: number()
    .nullable()
    .min(0.01, "El precio de descuento debe ser mayor a 0")
    .test(
      "discount-menor-que-store-price",
      "El precio de descuento debe ser menor al precio de tienda",
      function (value) {
        const { store_price, sale_price } = this.parent;
        const basePrice = store_price ?? sale_price;
        return value == null || basePrice === undefined || value < basePrice;
      }
    ),
};

export const schemaFormProduct = object().shape({
  name: string().required("El nombre del producto es requerido"),
  category: string().required("Seleccione una categoria"),
  brand: string().required("Seleccione una marca"),
  stock_type: string().required("Seleccione un tipo de stock"),
  sale_price: number().required("El precio del producto es requerido"),
  ...minSalePriceField,
  ...storePricingFields,
  min_stock: number()
    .required("El stock mínimo es requerido")
    .min(0, "El stock mínimo no puede ser negativo"),
  max_stock: number()
    .required("El stock máximo es requerido")
    .min(1, "El stock máximo debe ser al menos 1")
    .test(
      "max-stock-mayor-que-min-stock",
      "El stock máximo debe ser mayor o igual al stock mínimo",
      function (value) {
        const { min_stock } = this.parent;
        return (
          value === undefined || min_stock === undefined || value >= min_stock
        );
      }
    ),
});

export const schemaFormUpdateProduct = object().shape({
  code: string().required("El codigo del producto es requerido"),
  name: string().required("El nombre del producto es requerido"),
  category: string().required("Seleccione una categoria"),
  brand: string().required("Seleccione una marca"),
  stock_type: string().required("Seleccione un tipo de stock"),
  sale_price: number().required("El precio del producto es requerido"),
  ...minSalePriceField,
  ...storePricingFields,
  min_stock: number()
    .required("El stock mínimo es requerido")
    .min(0, "El stock mínimo no puede ser negativo"),
  max_stock: number()
    .required("El stock máximo es requerido")
    .min(1, "El stock máximo debe ser al menos 1")
    .test(
      "max-stock-mayor-que-min-stock",
      "El stock máximo debe ser mayor o igual al stock mínimo",
      function (value) {
        const { min_stock } = this.parent;
        return (
          value === undefined || min_stock === undefined || value >= min_stock
        );
      }
    ),
});
