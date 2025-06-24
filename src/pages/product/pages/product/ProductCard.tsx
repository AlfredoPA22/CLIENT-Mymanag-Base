import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { FC } from "react";
import defaultProduct from "../../../../assets/defaultProduct.jpg";
import { IProduct } from "../../../../utils/interfaces/Product";
import { getStatus } from "../../../order/utils/getStatus";
import useAuth from "../../../auth/hooks/useAuth";

interface ProductCardProps {
  productData: IProduct;
}

const ProductCard: FC<ProductCardProps> = ({ productData }) => {
  const { currency } = useAuth();
  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

  return (
    <Card className="w-full mx-auto shadow-lg rounded-xl p-5">
      <div className="flex flex-col md:flex-row items-start gap-6">
        {/* Imagen: tamaño fijo, responsive */}
        <div className="w-[128px] h-[128px] mx-auto md:mx-0 mb-5 flex-shrink-0">
          <Image
            src={productData.image ? productData.image : defaultProduct}
            alt={productData.name}
            className="w-full h-full object-cover rounded-lg shadow-md"
          />
        </div>

        {/* Información */}
        <div className="flex-1 space-y-2 w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <h2 className="text-xl font-bold text-center md:text-left">
              {productData.name}
            </h2>
            <div className="text-center md:text-right">
              {statusBodyTemplate(productData)}
            </div>
          </div>

          <p className="text-gray-500 text-center md:text-left">
            {productData.description}
          </p>

          <Divider className="my-2" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Código:</p>
              <p className="font-semibold">{productData.code}</p>
            </div>
            <div>
              <p className="text-gray-400">Stock:</p>
              <p
                className={`font-semibold ${
                  productData.stock > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {productData.stock} {productData.stock_type}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Precio de Venta:</p>
              <p className="font-semibold text-blue-500">
                {currency} {productData.sale_price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Último Costo:</p>
              <p className="font-semibold text-gray-600">
                {currency} {productData.last_cost_price.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Marca:</p>
              <p className="font-semibold">{productData.brand?.name}</p>
            </div>
            <div>
              <p className="text-gray-400">Categoría:</p>
              <p className="font-semibold">{productData.category?.name}</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProductCard;
