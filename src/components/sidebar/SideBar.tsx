import { Sidebar } from "primereact/sidebar";
import {
  AiOutlineShoppingCart,
  AiOutlineTags,
  AiOutlineUser,
} from "react-icons/ai";
import { BiImport } from "react-icons/bi";
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
  const { logout, userName, permissions, companyName } = useAuth();

  const menuSections = [
    {
      title: "Inicio",
      items: [
        {
          label: "Dashboard",
          icon: <MdDashboard />,
          to: ROUTES_MOCK.DASHBOARD,
          permission: [],
        },
      ],
    },
    {
      title: "Inventario",
      items: [
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
              label: "Bajo stock",
              to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.LOW_PRODUCTS}`,
              permission: ["LIST_AND_CREATE_PRODUCT"],
              icon: <BsBoxSeam />,
            },
            {
              label: "Importar productos",
              to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.IMPORT_PRODUCTS}`,
              permission: ["LIST_AND_CREATE_PRODUCT"],
              icon: <BiImport />,
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
      ],
    },
    {
      title: "Compras",
      items: [
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
      ],
    },
    {
      title: "Ventas",
      items: [
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
      ],
    },
    {
      title: "Reportes",
      items: [
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
      ],
    },
    {
      title: "Administración",
      items: [
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
      ],
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
      <div className="flex flex-col items-center py-3 border-b border-gray-200">
        <img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
          alt="logo"
          className="w-16 h-16 rounded-full mb-2 shadow-md"
        />
        <span className="text-sm font-medium">{userName || "Usuario"}</span>
        <span className="text-xs text-gray-500 mt-1">
          {companyName || "Empresa"}
        </span>
      </div>

      {/* Menú con scroll */}
      <div className="flex-grow overflow-y-auto px-4 py-2 space-y-2">
        <nav className="flex flex-col gap-1">
          {menuSections.map((section, i) => {
            const visibleItems = section.items.filter(
              (item) =>
                hasPermission(item.permission) ||
                item.items?.some((sub) => hasPermission(sub.permission))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={i}>
                <div className="uppercase text-[10px] text-[#A0C82E] font-semibold mt-6 mb-2 tracking-wider">
                  {section.title}
                </div>

                {visibleItems.map((item, j) => (
                  <SidebarMenuItem
                    key={j}
                    item={item}
                    handleNavigate={handleNavigate}
                    location={location}
                  />
                ))}
              </div>
            );
          })}
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
