import { FC } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import { ROUTES_MOCK } from "../../routes/RouteMocks";

const WelcomePage: FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4">
      <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-10 max-w-md w-full text-center">
        <img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
          alt="Logo"
          className="w-20 h-20 mx-auto mb-5 rounded-2xl shadow-sm"
        />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">¡Bienvenido!</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Sistema de gestión de inventarios para optimizar tus operaciones de
          compras, ventas, productos y almacenes.
        </p>

        <div className="grid sm:grid-cols-2 gap-3">
          <Link
            to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
            className="bg-slate-800 hover:bg-slate-900 text-white font-medium py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition text-sm"
          >
            Inventario <AiOutlineArrowRight />
          </Link>
          <Link
            to={ROUTES_MOCK.SALE_ORDERS}
            className="bg-[#A0C82E] hover:bg-[#8fb029] text-white font-medium py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition text-sm"
          >
            Ventas <AiOutlineArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
