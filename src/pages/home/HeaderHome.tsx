import { FC } from "react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import useGeneralData from "./hooks/useGeneralData";
import { Link } from "react-router-dom";

const HeaderHome: FC = () => {
  const { generalData, loadingGeneralData } = useGeneralData();

  if (loadingGeneralData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
      <Link
        to={`/order/saleOrder`}
        className="raised-3xl font-bold bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Cantidad de ventas</label>
          <i className="pi pi-chart-line text-3xl" />
        </div>

        <span className="flex justify-center items-center text-3xl">
          {generalData.total_sales_number}
        </span>
      </Link>

      <Link
        to={`/order/saleOrder`}
        className="raised-3xl bg-[#14B8A6] text-white font-bold p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Total de ventas</label>
          <i className="pi pi-dollar text-3xl" />
        </div>

        <span className="flex justify-center items-center text-3xl">
          {generalData.total_sales_value} {currencySymbol}
        </span>
      </Link>

      <Link
        to={`/product`}
        className="raised-3xl bg-[#919293] text-white font-bold p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Productos</label>
          <i className="pi pi-box text-3xl" />
        </div>

        <span className="flex justify-center items-center text-3xl">
          {generalData.total_products_number}
        </span>
      </Link>
      <Link
        to={`/product`}
        className="raised-3xl bg-[#606162] text-white font-bold p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Stock de productos</label>
          <i className="pi pi-box text-3xl" />
        </div>

        <span className="flex justify-center items-center text-3xl">
          {generalData.stock} pz
        </span>
      </Link>
      <Link
        to={`/product`}
        className="raised-3xl bg-[#596cbd] text-white font-bold p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Productos fuera de stock</label>
          <i className="pi pi-exclamation-triangle text-3xl" />
        </div>

        <span className="flex justify-center items-center text-3xl">
          {generalData.total_products_out}
        </span>
      </Link>
      <Link
        to={`/product`}
        className="raised-3xl bg-[#FFAB40] text-white font-bold p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <label>Producto mas vendido</label>
          <i className="pi pi-star text-3xl" />
        </div>

        <span className="flex justify-center items-center text-xl">
          {generalData.best_product.name}
        </span>

        <span className="flex justify-center items-center text-xl">
          Ventas: {generalData.best_product_sales_number}
        </span>
      </Link>
    </div>
  );
};

export default HeaderHome;
