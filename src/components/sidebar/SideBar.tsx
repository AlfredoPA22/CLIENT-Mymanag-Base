import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "primereact/sidebar";
import {
  AiOutlineShoppingCart,
  AiOutlineTags,
  AiOutlineUser,
} from "react-icons/ai";
import { BiImport, BiTransfer, BiRevision } from "react-icons/bi";
import { FiChevronLeft, FiPackage, FiTruck } from "react-icons/fi";
import { HiOutlineUsers } from "react-icons/hi";
import {
  MdCategory,
  MdDashboard,
  MdInventory,
  MdOutlineInventory,
  MdSettings,
  MdWarehouse,
} from "react-icons/md";
import { PiSignOut, PiUsersThree } from "react-icons/pi";
import { RiStore3Line } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { canDoAny } from "../../casl/ability";
import { useAbility } from "../../casl/AbilityContext";
import useAuth from "../../pages/auth/hooks/useAuth";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { SidebarMenuItem } from "./SideBarMenuItem";

type Props = {
  visible?: boolean;
  onHide?: () => void;
  overlay?: boolean;
  fixed?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

const SidebarMenu = ({
  visible,
  onHide,
  overlay = false,
  fixed = false,
  collapsed = false,
  onToggleCollapse,
}: Props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userName, companyName } = useAuth();
  const ability = useAbility();
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
          permission: ["LIST_PRODUCT", "CREATE_PRODUCT"],
          items: [
            {
              label: "Gestión de productos",
              to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`,
              permission: ["LIST_PRODUCT"],
              icon: <MdInventory />,
            },
            {
              label: "Importar productos",
              to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.IMPORT_PRODUCTS}`,
              permission: ["CREATE_PRODUCT"],
              icon: <BiImport />,
            },
          ],
        },
        {
          label: "Marcas",
          icon: <AiOutlineTags />,
          to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.BRANDS}`,
          permission: ["LIST_BRAND"],
        },
        {
          label: "Categorías",
          icon: <MdCategory />,
          to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.CATEGORIES}`,
          permission: ["LIST_CATEGORY"],
        },
        {
          label: "Almacenes",
          icon: <MdWarehouse />,
          to: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.WAREHOUSES}`,
          permission: ["LIST_WAREHOUSE"],
        },
        {
          label: "Transferencias",
          icon: <BiTransfer />,
          to: ROUTES_MOCK.TRANSFERS,
          permission: ["LIST_TRANSFER", "DETAIL_TRANSFER"],
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
          permission: ["LIST_PURCHASE"],
        },
        {
          label: "Proveedores",
          icon: <FiTruck />,
          to: ROUTES_MOCK.PROVIDERS,
          permission: ["LIST_PROVIDER"],
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
          permission: ["LIST_SALE"],
        },
        {
          label: "Clientes",
          icon: <HiOutlineUsers />,
          to: ROUTES_MOCK.CLIENTS,
          permission: ["LIST_CLIENT"],
        },
        {
          label: "Devoluciones",
          icon: <BiRevision />,
          to: ROUTES_MOCK.SALE_RETURNS,
          permission: ["LIST_SALE"],
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
    {
      title: "Configuración",
      items: [
        {
          label: "Mi empresa",
          icon: <MdSettings />,
          to: ROUTES_MOCK.SETTINGS,
          permission: [],
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
    requiredPermissions.length === 0 || canDoAny(ability, requiredPermissions);

  const initials =
    (userName ?? "")
      .split(" ")
      .slice(0, 2)
      .map((w: string) => w[0])
      .join("")
      .toUpperCase() || "U";

  const SidebarLayout = (
    <div id="sidebar-menu" className="h-full flex flex-col bg-slate-900 text-slate-100 w-full overflow-hidden">
      {/* Header */}
      <div
        className={`flex flex-col items-center gap-3 pt-5 pb-4 border-b border-white/10 transition-all duration-300 ${
          collapsed ? "px-2" : "px-4"
        }`}
      >
        <motion.img
          src="https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
          alt="logo"
          className="w-9 h-9 rounded-xl object-cover flex-shrink-0"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        />

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 w-full bg-white/5 rounded-xl px-3 py-2.5 overflow-hidden"
            >
              <div className="w-8 h-8 rounded-lg bg-[#A0C82E]/20 flex items-center justify-center flex-shrink-0">
                <span className="text-[#A0C82E] text-xs font-bold">
                  {initials}
                </span>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white truncate leading-tight">
                  {userName || "Usuario"}
                </span>
                <span className="text-xs text-slate-400 truncate leading-tight">
                  {companyName || "Empresa"}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Avatar when collapsed */}
        {collapsed && (
          <div className="relative group/avatar">
            <div className="w-9 h-9 rounded-lg bg-[#A0C82E]/20 flex items-center justify-center">
              <span className="text-[#A0C82E] text-sm font-bold">
                {initials}
              </span>
            </div>
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-700 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-150 pointer-events-none z-[200] shadow-lg">
              <p className="font-semibold">{userName || "Usuario"}</p>
              <p className="text-slate-400">{companyName || "Empresa"}</p>
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
            </div>
          </div>
        )}
      </div>

      {/* Menu */}
      <div
        className={`flex-grow overflow-y-auto sidebar-scroll py-3 ${
          collapsed ? "px-1.5" : "px-3"
        }`}
      >
        <nav className="flex flex-col gap-0.5">
          {menuSections.map((section, i) => {
            const visibleItems = section.items.filter(
              (item) =>
                hasPermission(item.permission) ||
                item.items?.some((sub) => hasPermission(sub.permission))
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={i} className={i > 0 ? "mt-4" : ""}>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="uppercase text-[10px] text-slate-500 font-semibold mb-1.5 px-3 tracking-widest"
                    >
                      {section.title}
                    </motion.div>
                  )}
                </AnimatePresence>

                {collapsed && i > 0 && (
                  <div className="h-px bg-white/5 mx-1 mb-3" />
                )}

                {visibleItems.map((item, j) => (
                  <SidebarMenuItem
                    key={j}
                    item={item}
                    handleNavigate={handleNavigate}
                    location={location}
                    collapsed={collapsed}
                  />
                ))}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Logout */}
      <div
        className={`py-3 border-t border-white/10 ${
          collapsed ? "px-1.5" : "px-3"
        }`}
      >
        <div className="relative group/logout">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: collapsed ? 0 : 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`w-full flex items-center gap-3 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 ${
              collapsed ? "justify-center px-0 py-3" : "py-2.5 px-3"
            }`}
          >
            <PiSignOut className="text-lg flex-shrink-0" />
            {!collapsed && <span>Cerrar sesión</span>}
          </motion.button>
          {collapsed && (
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-700 border border-white/10 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover/logout:opacity-100 transition-opacity duration-150 pointer-events-none z-[200] shadow-lg">
              Cerrar sesión
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-700" />
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return fixed ? (
    <motion.div
      animate={{ width: collapsed ? 64 : 256 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="h-screen shadow-2xl flex-shrink-0 relative"
      style={{ overflow: "visible" }}
    >
      {/* Inner content with overflow-hidden */}
      <div className="h-full overflow-hidden">{SidebarLayout}</div>

      {/* Toggle button — outside overflow-hidden so it's never clipped */}
      {onToggleCollapse && (
        <motion.button
          onClick={onToggleCollapse}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-14 -right-3 z-50 w-6 h-6 rounded-full bg-slate-700 border border-white/15 flex items-center justify-center shadow-lg hover:bg-[#A0C82E] hover:border-[#A0C82E] transition-colors duration-200"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <FiChevronLeft className="text-[10px] text-white" />
          </motion.span>
        </motion.button>
      )}
    </motion.div>
  ) : (
    <Sidebar
      visible={visible}
      onHide={onHide || (() => {})}
      position="left"
      className="w-64 shadow-2xl p-0"
      style={{ background: "#0f172a", zIndex: 999 }}
      showCloseIcon
    >
      {SidebarLayout}
    </Sidebar>
  );
};

export default SidebarMenu;
