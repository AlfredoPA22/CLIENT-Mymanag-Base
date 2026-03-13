import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TOUR_ON_NAV_KEY = "scheduledTourPath";

const tourSteps: Record<string, DriveStep[]> = {
  "/dashboard": [
    {
      element: "#sidebar-menu",
      popover: {
        title: "Menú de navegación",
        description:
          "Desde aquí accedes a todos los módulos del sistema: inventario, compras, ventas, reportes y más.",
        side: "right",
      },
    },
    {
      element: "#dashboard-main",
      popover: {
        title: "Dashboard",
        description:
          "Aquí verás un resumen general del estado de tu negocio: productos, compras, ventas y alertas de stock.",
        side: "bottom",
      },
    },
  ],
  "/inventario/productos": [
    {
      element: "#product-list-table",
      popover: {
        title: "Lista de productos",
        description:
          "Consulta todos los productos registrados. Puedes filtrar, ordenar y buscar directamente en la tabla.",
        side: "top",
      },
    },
    {
      element: "#btn-new-product",
      popover: {
        title: "Agregar producto",
        description:
          "Haz clic aquí para registrar un nuevo producto. Podrás definir nombre, categoría, precio, stock y más.",
        side: "left",
      },
    },
    {
      element: "#btn-search-product",
      popover: {
        title: "Búsqueda avanzada",
        description:
          "Filtra productos por nombre, categoría, marca o almacén para encontrar lo que necesitas más rápido.",
        side: "left",
      },
    },
  ],
  "/inventario/productos-bajo-stock": [
    {
      element: "#low-stock-table",
      popover: {
        title: "Productos con bajo stock",
        description:
          "Aquí aparecen los productos cuyo stock está por debajo del mínimo configurado. Tómalos en cuenta para tus próximas compras.",
        side: "top",
      },
    },
  ],
  "/inventario/almacenes": [
    {
      element: "#warehouse-list-table",
      popover: {
        title: "Gestión de almacenes",
        description:
          "Administra los almacenes donde guardas tu inventario. Puedes crear, editar y consultar cada uno.",
        side: "top",
      },
    },
    {
      element: "#btn-new-warehouse",
      popover: {
        title: "Nuevo almacén",
        description: "Registra un nuevo almacén con nombre y descripción.",
        side: "left",
      },
    },
  ],
  "/transferencias": [
    {
      element: "#transfer-list-table",
      popover: {
        title: "Transferencias de productos",
        description:
          "Aquí se listan todas las transferencias entre almacenes. Puedes ver su estado, aprobarlas o eliminarlas.",
        side: "top",
      },
    },
    {
      element: "#btn-new-transfer",
      popover: {
        title: "Nueva transferencia",
        description:
          "Inicia una transferencia de productos de un almacén a otro.",
        side: "left",
      },
    },
  ],
  "/nueva-transferencia": [
    {
      element: "#transfer-form",
      popover: {
        title: "Crear transferencia",
        description:
          "Selecciona la fecha, almacén origen y destino, luego haz clic en 'Crear transferencia'.",
        side: "right",
      },
    },
    {
      element: "#transfer-detail-form",
      popover: {
        title: "Agregar productos",
        description:
          "Añade los productos que deseas transferir indicando la cantidad. Puedes agregar varios productos.",
        side: "bottom",
      },
    },
    {
      element: "#transfer-detail-table",
      popover: {
        title: "Productos en la transferencia",
        description:
          "Aquí verás el detalle de los productos agregados. Puedes eliminar cualquiera antes de aprobar.",
        side: "top",
      },
    },
  ],
  "/compras": [
    {
      element: "#purchase-list-table",
      popover: {
        title: "Órdenes de compra",
        description:
          "Gestiona todas tus órdenes de compra. Puedes ver el estado, aprobar y ver el detalle de cada una.",
        side: "top",
      },
    },
    {
      element: "#btn-new-purchase",
      popover: {
        title: "Nueva orden de compra",
        description:
          "Registra una compra a un proveedor seleccionando los productos y cantidades.",
        side: "left",
      },
    },
  ],
  "/ventas": [
    {
      element: "#sale-list-table",
      popover: {
        title: "Órdenes de venta",
        description:
          "Visualiza y gestiona todas tus ventas. Puedes ver el estado, registrar pagos y generar reportes.",
        side: "top",
      },
    },
    {
      element: "#btn-new-sale",
      popover: {
        title: "Nueva venta",
        description:
          "Crea una nueva orden de venta asignando cliente, productos y condiciones de pago.",
        side: "left",
      },
    },
  ],
  "/reportes": [
    {
      element: "#reports-main",
      popover: {
        title: "Panel de reportes",
        description:
          "Genera reportes de productos, compras y ventas. Puedes exportarlos a PDF para compartirlos.",
        side: "top",
      },
    },
  ],
  "/usuarios": [
    {
      element: "#users-list-table",
      popover: {
        title: "Gestión de usuarios",
        description:
          "Administra los usuarios del sistema. Puedes crear nuevos usuarios y asignarles roles.",
        side: "top",
      },
    },
    {
      element: "#btn-new-user",
      popover: {
        title: "Nuevo usuario",
        description:
          "Crea un nuevo usuario asignándole un nombre, contraseña y rol dentro del sistema.",
        side: "left",
      },
    },
  ],
  "/roles": [
    {
      element: "#roles-list-table",
      popover: {
        title: "Roles y permisos",
        description:
          "Define los roles del sistema y configura los permisos de cada uno. Cada usuario tiene un rol asignado.",
        side: "top",
      },
    },
    {
      element: "#btn-new-role",
      popover: {
        title: "Nuevo rol",
        description:
          "Crea un rol con nombre y descripción. Luego podrás asignarle permisos específicos.",
        side: "left",
      },
    },
  ],
  "/inventario/marcas": [
    {
      element: "#brand-list-table",
      popover: {
        title: "Gestión de marcas",
        description:
          "Administra las marcas de tus productos. Puedes editarlas directamente en la tabla haciendo doble clic.",
        side: "top",
      },
    },
    {
      element: "#btn-new-brand",
      popover: {
        title: "Nueva marca",
        description: "Registra una nueva marca para asociarla a tus productos.",
        side: "left",
      },
    },
  ],
  "/inventario/categorias": [
    {
      element: "#category-list-table",
      popover: {
        title: "Gestión de categorías",
        description:
          "Organiza tus productos en categorías. Puedes editarlas directamente en la tabla.",
        side: "top",
      },
    },
    {
      element: "#btn-new-category",
      popover: {
        title: "Nueva categoría",
        description:
          "Crea una nueva categoría para clasificar mejor tu inventario.",
        side: "left",
      },
    },
  ],
  "/proveedores": [
    {
      element: "#provider-list-table",
      popover: {
        title: "Gestión de proveedores",
        description:
          "Administra los proveedores de tu negocio. Puedes editarlos directamente en la tabla.",
        side: "top",
      },
    },
    {
      element: "#btn-new-provider",
      popover: {
        title: "Nuevo proveedor",
        description:
          "Registra un proveedor con nombre, dirección y teléfono para asociarlo a tus órdenes de compra.",
        side: "left",
      },
    },
  ],
  "/clientes": [
    {
      element: "#client-list-table",
      popover: {
        title: "Gestión de clientes",
        description:
          "Administra los clientes de tu negocio. Puedes editarlos directamente en la tabla.",
        side: "top",
      },
    },
    {
      element: "#btn-new-client",
      popover: {
        title: "Nuevo cliente",
        description:
          "Registra un cliente con nombre, correo, teléfono y dirección para asociarlo a tus ventas.",
        side: "left",
      },
    },
  ],
};

const defaultSteps: DriveStep[] = [
  {
    element: "#sidebar-menu",
    popover: {
      title: "Menú de navegación",
      description:
        "Desde aquí accedes a todos los módulos del sistema.",
      side: "right",
    },
  },
];

const runTourForPath = (pathname: string) => {
  const steps = tourSteps[pathname] ?? defaultSteps;

  const availableSteps = steps.filter((step) => {
    if (!step.element) return true;
    return document.querySelector(step.element as string) !== null;
  });

  if (availableSteps.length === 0) return;

  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayOpacity: 0.5,
    stagePadding: 8,
    stageRadius: 8,
    nextBtnText: "Siguiente →",
    prevBtnText: "← Anterior",
    doneBtnText: "Finalizar",
    progressText: "{{current}} de {{total}}",
    popoverClass: "mymanag-tour-popover",
    steps: availableSteps,
  });

  driverObj.drive();
};

export const useTour = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-start tour when navigating via schedulePageTour
  useEffect(() => {
    const scheduled = localStorage.getItem(TOUR_ON_NAV_KEY);
    if (!scheduled || scheduled !== location.pathname) return;
    localStorage.removeItem(TOUR_ON_NAV_KEY);

    // Retry until elements are in DOM (max 3s)
    const start = Date.now();
    const tryStart = () => {
      if (Date.now() - start > 3000) return;
      const steps = tourSteps[location.pathname];
      const firstEl = steps?.find((s) => s.element)?.element as string | undefined;
      if (!firstEl || document.querySelector(firstEl)) {
        runTourForPath(location.pathname);
      } else {
        setTimeout(tryStart, 250);
      }
    };
    setTimeout(tryStart, 400);
  }, [location.pathname]);

  const startTour = () => runTourForPath(location.pathname);

  const schedulePageTour = (path: string) => {
    if (location.pathname === path) {
      runTourForPath(path);
    } else {
      localStorage.setItem(TOUR_ON_NAV_KEY, path);
      navigate(path);
    }
  };

  return { startTour, schedulePageTour };
};
