import { FC } from "react";
import { LuShieldAlert } from "react-icons/lu";

const UnauthorizedPage: FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-md text-center">
        <LuShieldAlert className="mx-auto text-red-500" size={48} />
        <h2 className="text-2xl font-semibold mt-4 text-gray-800">
          Acceso no autorizado
        </h2>
        <p className="mt-2 text-gray-600">
          No tienes permiso para acceder a esta página.
        </p>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
