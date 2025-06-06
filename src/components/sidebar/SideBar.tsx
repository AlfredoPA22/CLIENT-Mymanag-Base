import { Sidebar } from "primereact/sidebar";
import {
  AiOutlineShoppingCart,
  AiOutlineTags,
  AiOutlineUser,
} from "react-icons/ai";
import { BsBoxSeam } from "react-icons/bs";
import { FiPackage, FiTruck } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import {
  MdCategory,
  MdDashboard,
  MdInventory,
  MdOutlineInventory,
  MdWarehouse,
} from "react-icons/md";
import { PiSignOut, PiUsersThree } from "react-icons/pi";
import { RiStore3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/LOGO.png";
import useAuth from "../../pages/auth/hooks/useAuth";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { SidebarMenuItem } from "./SideBarMenuItem";

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
  const location = useLocation();
  const { logout, userName, permissions } = useAuth();

  const menuItems = [
    { type: "title", label: "Inicio" },
    {
      label: "Dashboard",
      icon: <MdDashboard />,
      to: ROUTES_MOCK.DASHBOARD,
      permission: [],
    },
    { type: "title", label: "Inventario" },
    {
      label: "Productos",
      icon: <FiPackage />,
      permission: ["LIST_AND_CREATE_PRODUCT"],
      items: [
        {
          label: "Gestión de productos",
          to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`,
          permission: ["LIST_AND_CREATE_PRODUCT"],
          icon: <MdInventory />,
        },
        {
          label: "Sin stock",
          to: "/products/out-of-stock",
          permission: ["LIST_AND_CREATE_PRODUCT"],
          icon: <BsBoxSeam />,
        },
      ],
    },
    {
      label: "Marcas",
      icon: <AiOutlineTags />,
      to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.BRANDS}`,
      permission: ["LIST_AND_CREATE_BRAND"],
    },
    {
      label: "Categorías",
      icon: <MdCategory />,
      to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.CATEGORIES}`,
      permission: ["LIST_AND_CREATE_CATEGORY"],
    },
    {
      label: "Almacenes",
      icon: <MdWarehouse />,
      to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.WAREHOUSES}`,
      permission: ["LIST_AND_CREATE_WAREHOUSE"],
    },

    { type: "title", label: "Compras" },
    {
      label: "Órdenes de compra",
      icon: <AiOutlineShoppingCart />,
      to: ROUTES_MOCK.PURCHASE_ORDERS,
      permission: ["LIST_AND_CREATE_PURCHASE"],
    },
    {
      label: "Proveedores",
      icon: <FiTruck />,
      to: ROUTES_MOCK.PROVIDERS,
      permission: ["LIST_AND_CREATE_PROVIDER"],
    },

    { type: "title", label: "Ventas" },
    {
      label: "Órdenes de venta",
      icon: <RiStore3Line />,
      to: ROUTES_MOCK.SALE_ORDERS,
      permission: ["LIST_AND_CREATE_SALE"],
    },
    {
      label: "Clientes",
      icon: <HiOutlineUsers />,
      to: ROUTES_MOCK.CLIENTS,
      permission: ["LIST_AND_CREATE_CLIENT"],
    },

    { type: "title", label: "Reportes" },
    {
      label: "Panel de reportes",
      icon: <MdOutlineInventory />,
      to: ROUTES_MOCK.REPORTS,
      permission: [
        "PRODUCT_REPORT",
        "PURCHASE_ORDER_REPORT",
        "SALE_ORDER_REPORT",
      ],
    },

    { type: "title", label: "Administración" },
    {
      label: "Usuarios",
      icon: <AiOutlineUser />,
      to: ROUTES_MOCK.USERS,
      permission: ["USER_AND_ROLE"],
    },
    {
      label: "Roles y permisos",
      icon: <PiUsersThree />,
      to: ROUTES_MOCK.ROLES,
      permission: ["USER_AND_ROLE"],
    },
  ];

  const handleNavigate = (to: string) => {
    navigate(to);
    if (overlay && onHide) onHide();
  };

  const handleLogout = () => {
    logout();
    if (overlay && onHide) onHide();
  };

  const hasPermission = (requiredPermissions: string[] = []) =>
    requiredPermissions.length === 0 ||
    requiredPermissions.some((p) => permissions.includes(p));

  const SidebarLayout = (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-100 via-white to-white text-gray-800 shadow-lg w-full">
      {/* Logo y Usuario */}
      <div className="flex flex-col items-center py-6 border-b border-gray-200">
        <img
          src={logo}
          alt="logo"
          className="w-16 h-16 rounded-full mb-2 shadow-md"
        />
        <span className="text-sm font-medium">{userName || "Usuario"}</span>
      </div>

      {/* Menú con scroll */}
      <div className="flex-grow overflow-y-auto px-4 py-6 space-y-2">
        <nav className="flex flex-col gap-1">
          {menuItems
            .filter(
              (item) =>
                item.type === "title" || hasPermission(item.permission ?? [])
            )
            .map((item, index) =>
              item.type === "title" ? (
                <div
                  key={index}
                  className="uppercase text-[10px] text-gray-500 font-semibold mt-6 mb-2 tracking-wider"
                >
                  {item.label}
                </div>
              ) : (
                <SidebarMenuItem
                  key={index}
                  item={item}
                  handleNavigate={handleNavigate}
                  location={location}
                />
              )
            )}
        </nav>
      </div>

      {/* Logout */}
      <div className="px-4 py-4 border-t border-gray-200">
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
    </div>
  );

  return fixed ? (
    <div className="w-72 h-screen">{SidebarLayout}</div>
  ) : (
    <Sidebar
      visible={visible}
      onHide={onHide || (() => {})}
      position="left"
      className="w-72 sm:w-64 shadow-lg p-0"
      style={{ background: "#ffffff", zIndex: 999 }}
      showCloseIcon
    >
      {SidebarLayout}
    </Sidebar>
  );
};

export default SidebarMenu;
