import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC } from "react";
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
    <Card
      className="flex flex-col md:flex-row justify-center"
      title={productData.name}
      subTitle={productData.code}
      header={() => header(productData.image)}
    >
      <section className="flex flex-col gap-2 text-lg">
        {statusBodyTemplate(productData)}

        <div className="flex gap-2">
          <Tag severity="contrast">{productData.category.name}</Tag>
          <Tag severity="warning">{productData.brand.name}</Tag>
        </div>

        <div className="flex gap-2">
          <label htmlFor="sale_price">Precio de venta:</label>
          <span id="sale_price" className="font-extrabold">
            {productData.sale_price} {currencySymbol}
          </span>
        </div>

        <div className="flex gap-2">
          <label htmlFor="stock_type">Tipo de stock:</label>
          <span id="stock_type" className="font-extrabold">
            {productData.stock_type}
          </span>
        </div>

        <div className="flex gap-2">
          <label htmlFor="stock">Cantidad disponible:</label>
          <span id="stock" className="font-extrabold">
            {productData.stock} pz
          </span>
        </div>

        <div className="flex gap-2">
          <span>{productData.description}</span>
        </div>
      </section>
    </Card>
  );
};

export default ProductCard;
