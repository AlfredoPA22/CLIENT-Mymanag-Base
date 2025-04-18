import { FC } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import useGeneralData from "./hooks/useGeneralData";

const HeaderHome: FC = () => {
  const { generalData, loadingGeneralData } = useGeneralData();

  if (loadingGeneralData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Link
        to={`/order/saleOrder`}
        className="raised-3xl font-bold bg-white p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Cantidad de ventas</div>
        <div className="text-3xl font-semibold">
          {generalData.total_sales_number}
        </div>
        <i className="pi pi-chart-line text-2xl mt-2" />
      </Link>

      <Link
        to={`/order/saleOrder`}
        className="raised-3xl bg-[#14B8A6] text-white font-bold p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Total de ventas</div>
        <div className="text-3xl font-semibold">
          {generalData.total_sales_value} {currencySymbol}
        </div>
        <i className="pi pi-dollar text-2xl mt-2" />
      </Link>

      <Link
        to={`/product`}
        className="raised-3xl bg-[#919293] text-white font-bold p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Productos</div>
        <div className="text-3xl font-semibold">
          {generalData.total_products_number}
        </div>
        <i className="pi pi-box text-2xl mt-2" />
      </Link>

      <Link
        to={`/product`}
        className="raised-3xl bg-[#606162] text-white font-bold p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Stock de productos</div>
        <div className="text-3xl font-semibold">{generalData.stock} pz</div>
        <i className="pi pi-box text-2xl mt-2" />
      </Link>

      <Link
        to={`/product`}
        className="raised-3xl bg-[#596cbd] text-white font-bold p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Productos fuera de stock</div>
        <div className="text-3xl font-semibold">
          {generalData.total_products_out}
        </div>
        <i className="pi pi-exclamation-triangle text-2xl mt-2" />
      </Link>

      <Link
        to={`/product`}
        className="raised-3xl bg-[#FFAB40] text-white font-bold p-4 shadow-xl rounded-lg text-center"
      >
        <div className="text-lg mb-2">Producto más vendido</div>
        <div className="text-xl font-semibold">
          {generalData.best_product ? generalData.best_product.name : "Ninguno"}
        </div>
        <div className="text-xl">
          Ventas: {generalData.best_product_sales_number} pz
        </div>
        <i className="pi pi-star text-2xl mt-2" />
      </Link>
    </div>
  );
};

export default HeaderHome;
