import { AnimatePresence, motion } from "framer-motion";
import { Sidebar } from "primereact/sidebar";
import { useMemo, useState } from "react";
import {
  AiOutlineShoppingCart,
  AiOutlineTags,
  AiOutlineUser,
} from "react-icons/ai";
import { BiImport, BiTransfer, BiRevision } from "react-icons/bi";
import { FiChevronLeft, FiCreditCard, FiPackage, FiSearch, FiShoppingBag, FiTruck, FiX } from "react-icons/fi";
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
import usePlan from "../../hooks/usePlan";
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
  const { logout, userName, companyName, companyLogo } = useAuth();
  const ability = useAbility();
  const { isPro } = usePlan();
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
        {
          label: "Pagos",
          icon: <FiCreditCard />,
          to: ROUTES_MOCK.PAYMENTS,
          permission: ["LIST_PAYMENT"],
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
    ...(isPro
      ? [
          {
            title: "Tienda online",
            items: [
              {
                label: "Configuración",
                icon: <FiShoppingBag />,
                to: ROUTES_MOCK.STORE,
                permission: ["UPDATE_COMPANY"],
                exact: true,
              },
              {
                label: "Pedidos de la tienda",
                icon: <RiStore3Line />,
                to: `${ROUTES_MOCK.STORE}/pedidos`,
                permission: ["UPDATE_COMPANY"],
              },
            ],
          },
        ]
      : []),
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

  // Buscador de menú — solo tiene sentido en el panel overlay de móvil, para
  // no tener que navegar secciones/acordeones con el dedo.
  const isMobileDrawer = overlay;
  const [menuSearch, setMenuSearch] = useState("");

  const searchResults = useMemo(() => {
    if (!isMobileDrawer || !menuSearch.trim()) return null;

    const term = menuSearch.trim().toLowerCase();
    const results: { label: string; icon: React.ReactNode; to: string; sectionTitle: string }[] = [];

    for (const section of menuSections) {
      for (const item of section.items as any[]) {
        if (!hasPermission(item.permission)) continue;

        if (item.items) {
          for (const child of item.items) {
            if (!hasPermission(child.permission)) continue;
            if (child.label.toLowerCase().includes(term)) {
              results.push({
                label: child.label,
                icon: child.icon,
                to: child.to,
                sectionTitle: `${section.title} / ${item.label}`,
              });
            }
          }
        } else if (item.label.toLowerCase().includes(term)) {
          results.push({
            label: item.label,
            icon: item.icon,
            to: item.to,
            sectionTitle: section.title,
          });
        }
      }
    }

    return results;
  }, [isMobileDrawer, menuSearch, menuSections]);

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
        className={`flex flex-col items-center gap-3 pt-5 pb-4 border-b border-white/10 transition-all duration-300 ${collapsed ? "px-2" : "px-4"
          }`}
      >
        <motion.div
          className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center flex-shrink-0 p-2 overflow-hidden ring-1 ring-white/10"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          <img
            src={
              companyLogo ||
              "https://res.cloudinary.com/dyyd4no6j/image/upload/v1750462264/icono_inventasys_ca6zei.png"
            }
            alt="logo"
            className="w-full h-full object-contain"
          />
        </motion.div>

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

      {/* Buscador de menú — solo en el panel móvil */}
      {isMobileDrawer && (
        <div className="px-4 pt-3 pb-1">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={menuSearch}
              onChange={(e) => setMenuSearch(e.target.value)}
              placeholder="Buscar en el menú..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-9 text-base text-white placeholder:text-slate-500 focus:border-[#A0C82E]/50 focus:outline-none"
            />
            {menuSearch && (
              <button
                type="button"
                onClick={() => setMenuSearch("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Menu */}
      <div
        className={`flex-grow overflow-y-auto sidebar-scroll py-3 ${collapsed ? "px-1.5" : "px-3"
          }`}
      >
        {searchResults ? (
          <nav className="flex flex-col gap-0.5">
            {searchResults.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-500">
                No se encontró nada con "{menuSearch}".
              </p>
            ) : (
              searchResults.map((result, i) => (
                <button
                  key={i}
                  onClick={() => handleNavigate(result.to)}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3.5 text-left text-base font-medium text-slate-300 transition-colors duration-200 hover:bg-white/5 hover:text-white active:bg-white/10"
                >
                  <span className="flex-shrink-0 text-2xl text-slate-400">{result.icon}</span>
                  <span className="flex min-w-0 flex-col leading-tight">
                    <span className="truncate">{result.label}</span>
                    <span className="truncate text-xs text-slate-500">{result.sectionTitle}</span>
                  </span>
                </button>
              ))
            )}
          </nav>
        ) : (
          <nav className="flex flex-col gap-0.5">
            {menuSections.map((section, i) => {
              const visibleItems = section.items.filter(
                (item: any) =>
                  hasPermission(item.permission) ||
                  item.items?.some((sub: any) => hasPermission(sub.permission))
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
                        className={`uppercase text-slate-500 font-semibold tracking-widest ${
                          isMobileDrawer ? "text-xs mb-2 px-3.5" : "text-[10px] mb-1.5 px-3"
                        }`}
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
                      mobile={isMobileDrawer}
                    />
                  ))}
                </div>
              );
            })}
          </nav>
        )}
      </div>

      {/* Logout */}
      <div
        className={`py-3 border-t border-white/10 ${collapsed ? "px-1.5" : "px-3"
          }`}
      >
        <div className="relative group/logout">
          <motion.button
            onClick={handleLogout}
            whileHover={{ x: collapsed ? 0 : 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`w-full flex items-center gap-3 rounded-xl font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 ${
              isMobileDrawer ? "text-base" : "text-sm"
            } ${
              collapsed ? "justify-center px-0 py-3" : isMobileDrawer ? "py-3.5 px-3.5" : "py-2.5 px-3"
              }`}
          >
            <PiSignOut className={`flex-shrink-0 ${isMobileDrawer ? "text-2xl" : "text-lg"}`} />
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
      onHide={onHide || (() => { })}
      position="left"
      className="w-[85vw] max-w-[340px] shadow-2xl p-0"
      style={{ background: "#0f172a", zIndex: 999 }}
      showCloseIcon
    >
      {SidebarLayout}
    </Sidebar>
  );
};

export default SidebarMenu;
