import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Image } from "primereact/image";
import { Tag } from "primereact/tag";
import { FC } from "react";
import defaultProduct from "../../../assets/defaultProduct.jpg";
import { currencySymbol } from "../../../utils/constants/currencyConstants";
import { IProduct } from "../../../utils/interfaces/Product";
import { getStatus } from "../../order/utils/getStatus";

interface ProductCardProps {
  productData: IProduct;
}

const ProductCard: FC<ProductCardProps> = ({ productData }) => {
  const header = (urlImage: string) => (
    <img className="w-[300px] h-[300px]" alt="Card" src={urlImage} />
  );

  const statusBodyTemplate = (rowData: IProduct) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return <Tag severity={severity as "danger" | "success"}>{label}</Tag>;
    }
    return null;
  };

  return (
    <Card className="w-full md:w-3/4 lg:w-2/3 xl:w-1/2 mx-auto shadow-lg rounded-xl p-5">
      {/* Imagen y Nombre */}
      <div className="flex flex-col md:flex-row items-center gap-4">
        <Image
          src={productData.image ? productData.image : defaultProduct}
          alt={productData.image}
          className="w-32 h-32 object-cover rounded-lg shadow-md"
        />
        <div className="text-center md:text-left">
          <h2 className="text-xl font-bold">{productData.name}</h2>
          <p className="text-gray-500">{productData.description}</p>
          {statusBodyTemplate(productData)}
        </div>
      </div>

      <Divider />

      {/* Información de Producto */}
      <div className="grid grid-cols-2 gap-4 text-sm">
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
            {currencySymbol} {productData.sale_price.toFixed(2)}
          </p>
        </div>
        <div>
          <p className="text-gray-400">Último Costo:</p>
          <p className="font-semibold text-gray-600">
            {currencySymbol} {productData.last_cost_price.toFixed(2)}
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
    </Card>
  );
};

export default ProductCard;
