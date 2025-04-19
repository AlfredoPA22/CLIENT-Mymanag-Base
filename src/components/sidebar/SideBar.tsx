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
  const { permissions } = useAuth();
  const location = useLocation();
  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  const menuItems = [
    {
      label: "Inicio",
      icon: <AiFillHome />,
      to: "/",
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
      <div className="flex flex-col items-center mb-8 mt-4">
        <img
          src={logo}
          alt="logo"
          className="w-[80px] h-[70px] mb-2 rounded-full"
        />
      </div>

      <nav className="flex flex-col gap-2 px-4 flex-grow">
        {menuItems
          .filter((item) => hasPermission(item.permission))
          .map((item, index) => {
            const isActive = location.pathname === item.to;

            return (
              <button
                key={index}
                onClick={() => handleNavigate(item.to)}
                className={`flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  isActive
                    ? "bg-[#f1f5f9] text-[#1e293b] shadow"
                    : "bg-[#334155] text-[#e2e8f0] hover:bg-[#475569]"
                }`}
              >
                <span
                  className={`text-xl ${
                    isActive ? "text-[#1e293b]" : "text-[#e2e8f0]"
                  }`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 py-3 px-4 rounded-lg text-sm font-semibold text-white bg-[#ef4444] hover:bg-red-500 transition-all duration-300 mt-auto mb-5"
        >
          <span className="text-xl">
            <PiSignOut />
          </span>
          <span>Cerrar sesión</span>
        </button>
      </nav>
    </>
  );
};

export default SidebarMenu;
