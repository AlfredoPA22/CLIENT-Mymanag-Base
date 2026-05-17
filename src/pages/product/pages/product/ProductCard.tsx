import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { FC } from "react";
import defaultProduct from "../../../../assets/defaultProduct.jpg";
import { IProduct } from "../../../../utils/interfaces/Product";
import { getStatus } from "../../../order/utils/getStatus";
import useAuth from "../../../auth/hooks/useAuth";
import { PermissionGuard } from "../../../auth/pages/PermissionGuard";

interface ProductCardProps {
  productData: IProduct;
}

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  className?: string;
}

const StatCard: FC<StatCardProps> = ({ label, value, className = "bg-gray-50" }) => (
  <div className={`rounded-xl p-3 ${className}`}>
    <p className="text-xs text-gray-400 mb-1">{label}</p>
    {value}
  </div>
);

const ProductCard: FC<ProductCardProps> = ({ productData }) => {
  const { currency } = useAuth();
  const status = getStatus(productData.status);

  const stockColor =
    productData.stock <= 0
      ? "text-red-500"
      : productData.min_stock > 0 && productData.stock <= productData.min_stock
      ? "text-yellow-500"
      : "text-green-600";

  return (
    <Card className="w-full">
      {/* ── Cabecera: imagen + datos principales ─────────────── */}
      <div className="flex flex-col sm:flex-row gap-5 items-start">

        {/* Imagen */}
        <div className="w-full sm:w-44 sm:h-44 aspect-square flex-shrink-0 rounded-xl overflow-hidden shadow border border-gray-100 bg-gray-50 flex items-center justify-center mx-auto sm:mx-0">
          <Image
            src={productData.image || defaultProduct}
            alt={productData.name}
            imageClassName="w-full h-full object-contain"
            preview
          />
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h2 className="text-xl font-bold leading-tight break-words flex-1">
              {productData.name}
            </h2>
            {status && (
              <Tag severity={status.severity as any} className="shrink-0 text-xs">
                {status.label}
              </Tag>
            )}
          </div>

          <p className="text-xs text-gray-400 font-mono mb-3 tracking-wide">
            # {productData.code}
          </p>

          {productData.description && (
            <p className="text-sm text-gray-500 bg-gray-50 rounded-lg px-3 py-2 mb-4 border-l-4 border-gray-200">
              {productData.description}
            </p>
          )}

          {/* Stats rápidas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard
              label="Stock actual"
              className="bg-gray-50"
              value={
                <div>
                  <p className={`text-2xl font-bold ${stockColor}`}>
                    {productData.stock}
                  </p>
                  <Tag severity="secondary" className="text-xs mt-1">
                    {productData.stock_type}
                  </Tag>
                </div>
              }
            />

            <StatCard
              label="Precio de venta"
              className="bg-blue-50"
              value={
                <p className="text-xl font-bold text-blue-600">
                  {currency} {productData.sale_price.toFixed(2)}
                </p>
              }
            />

            <PermissionGuard permissions={["VIEW_PRODUCT_COST"]}>
              <StatCard
                label="Último costo"
                className="bg-gray-50"
                value={
                  <p className="text-xl font-bold text-gray-600">
                    {currency} {productData.last_cost_price.toFixed(2)}
                  </p>
                }
              />
            </PermissionGuard>
          </div>
        </div>
      </div>

      <Divider className="my-4" />

      {/* ── Detalles secundarios ─────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Marca</p>
          <p className="font-semibold truncate">{productData.brand?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Categoría</p>
          <p className="font-semibold truncate">{productData.category?.name ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Stock mínimo</p>
          <p className={`font-semibold ${
            productData.min_stock > 0 && productData.stock <= productData.min_stock
              ? "text-yellow-500"
              : "text-gray-700"
          }`}>
            {productData.min_stock > 0 ? productData.min_stock : "—"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-0.5">Stock máximo</p>
          <p className="font-semibold text-gray-700">
            {productData.max_stock > 0 ? productData.max_stock : "—"}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
