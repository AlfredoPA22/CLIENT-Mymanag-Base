import { FC } from "react";
import { Link } from "react-router-dom";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import useGeneralData from "./hooks/useGeneralData";
import HeaderHomeSkeleton from "../../components/skeleton/HeaderHomeSkeleton";

const cardBase =
  "rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl";

const HeaderHome: FC = () => {
  const { generalData, loadingGeneralData } = useGeneralData();

  if (loadingGeneralData) {
    return <HeaderHomeSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Link to="/order/saleOrder" className={`${cardBase} bg-white border`}>
        <div className="text-sm text-gray-500">Cantidad de ventas</div>
        <div className="text-4xl font-bold text-gray-800">
          {generalData.total_sales_number}
        </div>
        <div className="bg-teal-100 p-2 rounded-full mt-3">
          <i className="pi pi-chart-line text-teal-600 text-xl" />
        </div>
      </Link>

      <Link
        to="/order/saleOrder"
        className={`${cardBase} bg-gradient-to-r from-teal-500 to-emerald-500 text-white`}
      >
        <div className="text-sm">Total de ventas</div>
        <div className="text-4xl font-bold">
          {generalData.total_sales_value} {currencySymbol}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-dollar text-white text-xl" />
        </div>
      </Link>

      <Link to="/product" className={`${cardBase} bg-slate-600 text-white`}>
        <div className="text-sm">Productos</div>
        <div className="text-4xl font-bold">
          {generalData.total_products_number}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-box text-white text-xl" />
        </div>
      </Link>

      <Link to="/product" className={`${cardBase} bg-slate-700 text-white`}>
        <div className="text-sm">Stock de productos</div>
        <div className="text-4xl font-bold">{generalData.stock} pz</div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-box text-white text-xl" />
        </div>
      </Link>

      <Link to="/product" className={`${cardBase} bg-indigo-600 text-white`}>
        <div className="text-sm">Productos fuera de stock</div>
        <div className="text-4xl font-bold">
          {generalData.total_products_out}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-exclamation-triangle text-white text-xl" />
        </div>
      </Link>

      <Link to="/product" className={`${cardBase} bg-amber-400 text-white`}>
        <div className="text-sm">Producto más vendido</div>
        <div className="text-xl font-semibold">
          {generalData.best_product ? generalData.best_product.name : "Ninguno"}
        </div>
        <div className="text-lg font-medium">
          Ventas: {generalData.best_product_sales_number} pz
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-star text-white text-xl" />
        </div>
      </Link>
    </div>
  );
};

export default HeaderHome;
