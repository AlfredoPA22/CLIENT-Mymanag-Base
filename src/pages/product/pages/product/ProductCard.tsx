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

const ProductCard: FC<ProductCardProps> = ({ productData }) => {
  const { currency } = useAuth();

  const status = getStatus(productData.status);

  return (
    <Card className="w-full mx-auto shadow-lg rounded-xl">
      <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6">

        {/* Imagen */}
        <div className="w-24 h-24 md:w-32 md:h-32 mx-auto md:mx-0 flex-shrink-0">
          <Image
            src={productData.image ? productData.image : defaultProduct}
            alt={productData.name}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Información */}
        <div className="flex-1 w-full space-y-2">
          {/* Nombre + estado */}
          <div className="flex items-start justify-between gap-2">
            <h2 className="text-lg md:text-xl font-bold leading-tight break-all flex-1 min-w-0">
              {productData.name}
            </h2>
            {status && (
              <Tag severity={status.severity as "danger" | "success"} className="shrink-0">
                {status.label}
              </Tag>
            )}
          </div>

          {productData.description && (
            <p className="text-gray-500 text-sm">{productData.description}</p>
          )}

          <Divider className="my-2" />

          {/* Grid de datos */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <div className="overflow-hidden">
              <p className="text-gray-400 text-xs">Código</p>
              <p className="font-semibold break-all">{productData.code}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Stock</p>
              <p className={`font-semibold ${productData.stock > 0 ? "text-green-500" : "text-red-500"}`}>
                {productData.stock} <span className="text-gray-400 font-normal text-xs">{productData.stock_type}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Precio de venta</p>
              <p className="font-semibold text-blue-600">
                {currency} {productData.sale_price.toFixed(2)}
              </p>
            </div>
            <PermissionGuard permissions={["VIEW_PRODUCT_COST"]}>
              <div>
                <p className="text-gray-400 text-xs">Último costo</p>
                <p className="font-semibold text-gray-600">
                  {currency} {productData.last_cost_price.toFixed(2)}
                </p>
              </div>
            </PermissionGuard>
            <div className="overflow-hidden">
              <p className="text-gray-400 text-xs">Marca</p>
              <p className="font-semibold break-all">{productData.brand?.name ?? "—"}</p>
            </div>
            <div className="overflow-hidden">
              <p className="text-gray-400 text-xs">Categoría</p>
              <p className="font-semibold break-all">{productData.category?.name ?? "—"}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
