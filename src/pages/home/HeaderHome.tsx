import { FC } from "react";
import { Link } from "react-router-dom";
import useGeneralData from "./hooks/useGeneralData";
import HeaderHomeSkeleton from "../../components/skeleton/HeaderHomeSkeleton";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import useAuth from "../auth/hooks/useAuth";
import { formatDateRange } from "../../utils/dateUtils";

const card =
  "bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex flex-col items-center justify-center text-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group";

interface HeaderHomeProps {
  startDate: Date;
  endDate: Date;
}

const HeaderHome: FC<HeaderHomeProps> = ({ startDate, endDate }) => {
  const { generalData, loadingGeneralData } = useGeneralData(startDate, endDate);
  const { currency } = useAuth();
  const rangeLabel = formatDateRange(startDate, endDate);

  if (loadingGeneralData) {
    return <HeaderHomeSkeleton />;
  }

  return (
    <div className="flex flex-col gap-2">
    <p className="text-xs text-slate-400 font-medium">
      <i className="pi pi-calendar mr-1" />
      Período: <span className="text-slate-600">{rangeLabel}</span>
    </p>
    <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
      {/* Ventas del mes */}
      <Link to={ROUTES_MOCK.SALE_ORDERS} className={card}>
        <div className="w-11 h-11 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
          <i className="pi pi-shopping-cart text-teal-500 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            {generalData.total_sales_number}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Ventas del período
          </p>
        </div>
      </Link>

      {/* Total de ventas */}
      <Link to={ROUTES_MOCK.SALE_ORDERS} className={card}>
        <div className="w-11 h-11 rounded-xl bg-[#A0C82E]/10 group-hover:bg-[#A0C82E]/20 flex items-center justify-center transition-colors">
          <i className="pi pi-dollar text-[#A0C82E] text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            {generalData.total_sales_value}
            <span className="text-sm font-medium text-slate-400 ml-1">
              {currency}
            </span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Total ventas
          </p>
        </div>
      </Link>

      {/* Productos */}
      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
        className={card}
      >
        <div className="w-11 h-11 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
          <i className="pi pi-box text-indigo-500 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            {generalData.total_products_number}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Productos
          </p>
        </div>
      </Link>

      {/* Stock total */}
      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
        className={card}
      >
        <div className="w-11 h-11 rounded-xl bg-sky-50 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
          <i className="pi pi-inbox text-sky-500 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            {generalData.stock}
            <span className="text-sm font-medium text-slate-400 ml-1">pz</span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Stock total
          </p>
        </div>
      </Link>

      {/* Bajo stock */}
      <Link
        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
        className={card}
      >
        <div className="w-11 h-11 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
          <i className="pi pi-exclamation-triangle text-orange-400 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-slate-800">
            {generalData.total_products_low}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Bajo stock
          </p>
        </div>
      </Link>

      {/* Cuentas por cobrar - monto */}
      <Link to={ROUTES_MOCK.SALE_ORDERS} className={card}>
        <div className="w-11 h-11 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
          <i className="pi pi-credit-card text-rose-500 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-rose-600">
            {generalData.total_credit_pending ?? 0}
            <span className="text-sm font-medium text-slate-400 ml-1">
              {currency}
            </span>
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Por cobrar
          </p>
        </div>
      </Link>

      {/* Cuentas por cobrar - cantidad */}
      <Link to={ROUTES_MOCK.SALE_ORDERS} className={card}>
        <div className="w-11 h-11 rounded-xl bg-rose-50 group-hover:bg-rose-100 flex items-center justify-center transition-colors">
          <i className="pi pi-file text-rose-400 text-lg" />
        </div>
        <div>
          <p className="text-2xl font-bold text-rose-600">
            {generalData.total_credit_pending_count ?? 0}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
            Facturas pendientes
          </p>
        </div>
      </Link>

      {/* Mejor producto */}
      {generalData.best_product ? (
        <Link
          to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${generalData.best_product._id}`}
          className={card}
        >
          <div className="w-11 h-11 rounded-xl bg-amber-50 group-hover:bg-amber-100 flex items-center justify-center transition-colors">
            <i className="pi pi-star text-amber-400 text-lg" />
          </div>
          <div>
            <p
              className="text-sm font-bold text-slate-800 leading-tight line-clamp-2"
              title={generalData.best_product.name}
            >
              {generalData.best_product.name}
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5 font-semibold uppercase tracking-wide">
              Más vendido · {generalData.best_product_sales_number} vtas
            </p>
          </div>
        </Link>
      ) : (
        <div className={card}>
          <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center">
            <i className="pi pi-star text-slate-300 text-lg" />
          </div>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">
            Sin destacado
          </p>
        </div>
      )}
    </div>
    </div>
  );
};

export default HeaderHome;
