import { Sidebar } from "primereact/sidebar";
import { AiFillHome } from "react-icons/ai";
import {
  MdInsertChart,
  MdOutlineInventory,
  MdPeopleAlt,
  MdPointOfSale,
  MdProductionQuantityLimits,
} from "react-icons/md";
import { PiGearSix, PiSignOut } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/LOGO.png";
import useAuth from "../../pages/auth/hooks/useAuth";

type Props = {
  visible?: boolean;
  onHide?: () => void;
  overlay?: boolean;
  fixed?: boolean;
};

const SidebarMenu = ({
  visible,
  onHide,
  overlay = false,
  fixed = false,
}: Props) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleNavigate = (to: string) => {
    navigate(to);
    if (overlay && onHide) onHide();
  };

  const handleLogout = () => {
    logout();
    if (overlay && onHide) onHide();
  };

  // Fijo
  if (fixed) {
    return (
      <div className="w-64 h-full shadow-md flex flex-col bg-[#1e293b]">
        <SidebarContent
          handleNavigate={handleNavigate}
          handleLogout={handleLogout}
        />
      </div>
    );
  }

  // Overlay para móvil
  return (
    <Sidebar
      visible={visible}
      onHide={onHide || (() => {})} // ✅ garantiza que siempre haya función
      position="left"
      className="w-64 shadow-lg"
      style={{ background: "#1e293b", zIndex: 999 }}
      showCloseIcon
    >
      <SidebarContent
        handleNavigate={handleNavigate}
        handleLogout={handleLogout}
      />
    </Sidebar>
  );
};

import { useLocation } from "react-router-dom"; // 👈 Para saber la ruta actual

const SidebarContent = ({
  handleNavigate,
  handleLogout,
}: {
  handleNavigate: (to: string) => void;
  handleLogout: () => void;
}) => {
  const { permissions, userName } = useAuth();
  const location = useLocation();

  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((p) => permissions.includes(p));
  };

  const menuItems = [
    { label: "Inicio", icon: <AiFillHome />, to: "/", permission: [] },
    {
      label: "Dashboard",
      icon: <MdInsertChart />,
      to: "/dashboard",
      permission: [],
    },
    {
      label: "Inventario",
      icon: <MdProductionQuantityLimits />,
      to: "/product",
      permission: [
        "LIST_AND_CREATE_BRAND",
        "LIST_AND_CREATE_CATEGORY",
        "LIST_AND_CREATE_WAREHOUSE",
        "LIST_AND_CREATE_PRODUCT",
      ],
    },
    {
      label: "Compras",
      icon: <MdOutlineInventory />,
      to: "/order/purchaseOrder",
      permission: ["LIST_AND_CREATE_PROVIDER", "LIST_AND_CREATE_PURCHASE"],
    },
    {
      label: "Clientes",
      icon: <MdPeopleAlt />,
      to: "/client",
      permission: ["LIST_AND_CREATE_CLIENT"],
    },
    {
      label: "Ventas",
      icon: <MdPointOfSale />,
      to: "/order/saleOrder",
      permission: ["LIST_AND_CREATE_SALE"],
    },
    {
      label: "Reportes",
      icon: <MdInsertChart />,
      to: "/reports",
      permission: [
        "PRODUCT_REPORT",
        "PURCHASE_ORDER_REPORT",
        "SALE_ORDER_REPORT",
      ],
    },
    {
      label: "Admin",
      icon: <PiGearSix />,
      to: "/admin",
      permission: ["USER_AND_ROLE"],
    },
  ];

  return (
    <>
      {/* LOGO y usuario */}
      <div className="flex flex-col items-center py-6 border-b border-slate-700">
        <img
          src={logo}
          alt="logo"
          className="w-16 h-16 rounded-full mb-2 shadow-md"
        />
        <span className="text-slate-200 text-sm font-medium">
          {userName || "Usuario"}
        </span>
      </div>

      {/* Menú */}
      <nav className="flex flex-col gap-1 px-4 py-6 flex-grow">
        {menuItems
          .filter((item) => hasPermission(item.permission))
          .map((item, index) => {
            const isActive = location.pathname === item.to;

            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.to)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? "bg-slate-100 text-slate-800 shadow-inner"
                    : "text-slate-200 hover:bg-slate-600 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
      </nav>

      {/* Cerrar sesión */}
      <div className="mt-auto px-4 pb-5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300"
        >
          <span className="text-xl">
            <PiSignOut />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </div>
    </>
  );
};

export default SidebarMenu;
