import { FC } from "react";
import { Link } from "react-router-dom";
import useGeneralData from "./hooks/useGeneralData";
import HeaderHomeSkeleton from "../../components/skeleton/HeaderHomeSkeleton";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import useAuth from "../auth/hooks/useAuth";

const cardBase =
  "rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all duration-200 transform hover:-translate-y-1 hover:shadow-2xl";

const HeaderHome: FC = () => {
  const { generalData, loadingGeneralData } = useGeneralData();
  const { currency } = useAuth();

  if (loadingGeneralData) {
    return <HeaderHomeSkeleton />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <Link
        to={ROUTES_MOCK.SALE_ORDERS}
        className={`${cardBase} bg-white border`}
      >
        <div className="text-sm text-gray-500">Cantidad de ventas</div>
        <div className="text-4xl font-bold text-gray-800">
          {generalData.total_sales_number}
        </div>
        <div className="bg-teal-100 p-2 rounded-full mt-3">
          <i className="pi pi-chart-line text-teal-600 text-xl" />
        </div>
      </Link>

      <Link
        to={ROUTES_MOCK.SALE_ORDERS}
        className={`${cardBase} bg-gradient-to-r from-teal-500 to-emerald-500 text-white`}
      >
        <div className="text-sm">Total de ventas</div>
        <div className="text-4xl font-bold">
          {generalData.total_sales_value} {currency}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-dollar text-white text-xl" />
        </div>
      </Link>

      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
        className={`${cardBase} bg-slate-600 text-white`}
      >
        <div className="text-sm">Productos</div>
        <div className="text-4xl font-bold">
          {generalData.total_products_number}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-box text-white text-xl" />
        </div>
      </Link>

      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
        className={`${cardBase} bg-slate-700 text-white`}
      >
        <div className="text-sm">Stock de productos</div>
        <div className="text-4xl font-bold">{generalData.stock} pz</div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-box text-white text-xl" />
        </div>
      </Link>

      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.LOW_PRODUCTS}`}
        className={`${cardBase} bg-indigo-600 text-white`}
      >
        <div className="text-sm">Productos con bajo stock</div>
        <div className="text-4xl font-bold">
          {generalData.total_products_low}
        </div>
        <div className="bg-white/20 p-2 rounded-full mt-3">
          <i className="pi pi-exclamation-triangle text-white text-xl" />
        </div>
      </Link>

      {generalData.best_product ? (
        <Link
          to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${generalData.best_product._id}`}
          className={`${cardBase} bg-amber-400 text-white flex flex-col gap-1`}
        >
          <span className="text-sm font-medium">Producto más vendido</span>
          <span className="text-lg font-bold">
            {generalData.best_product.name}
          </span>
          <span className="text-sm">
            Ventas: {generalData.best_product_sales_number}
          </span>
          <div className="bg-white/20 p-2 rounded-full mt-3">
            <i className="pi pi-star text-white text-xl" />
          </div>
        </Link>
      ) : (
        <div className={`${cardBase} bg-gray-300 text-gray-600 italic`}>
          No hay producto destacado
        </div>
      )}
    </div>
  );
};

export default HeaderHome;
