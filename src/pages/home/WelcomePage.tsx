import { FC } from "react";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Link } from "react-router-dom";
import { ROUTES_MOCK } from "../../routes/RouteMocks";

const WelcomePage: FC = () => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-3xl w-full text-center">
        <img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
          alt="MYMANAG Logo"
          className="w-24 h-24 mx-auto mb-4 rounded-full shadow"
        />
        <h1 className="text-3xl font-bold text-slate-800 mb-2">¡Bienvenido!</h1>
        <p className="text-slate-600 mb-6">
          El sistema de gestión de inventarios diseñado para optimizar tus
          operaciones de compras, ventas, productos y almacenes.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`}
            className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
          >
            Ir al Inventario <AiOutlineArrowRight className="text-lg" />
          </Link>
          <Link
            to={ROUTES_MOCK.SALE_ORDERS}
            className="bg-teal-500 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-teal-600 transition"
          >
            Ver ventas <AiOutlineArrowRight className="text-lg" />
          </Link>
        </div>

        <p className="text-xs text-slate-400 mt-6">
          ¿Necesitas ayuda? Visita la sección de reportes o contacta con el
          administrador.
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
