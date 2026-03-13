import { driver, DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const FULL_TOUR_KEY = "fullTourActivePath";

interface TourPhase {
  path: string;
  nextPath?: string;
  nextLabel?: string;
  steps: DriveStep[];
}

// ── Flujo: Compra completa (Productos → Proveedores → Compras) ───────────────
export const purchaseProcessPhases: TourPhase[] = [
  {
    path: "/inventario/productos",
    nextPath: "/proveedores",
    nextLabel: "Ir a Proveedores →",
    steps: [
      {
        popover: {
          title: "🛒 Proceso de compra — Paso 1 de 3",
          description:
            "Antes de hacer una compra necesitas tener <b>productos registrados</b>. Te mostramos cómo hacerlo.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#product-list-table",
        popover: {
          title: "Lista de productos",
          description:
            "Aquí se listan todos tus productos. Verifica si el producto que quieres comprar ya existe.",
          side: "top",
        },
      },
      {
        element: "#btn-new-product",
        popover: {
          title: "Crear producto",
          description:
            "Si el producto no existe, regístralo aquí. Completa nombre, categoría, precio y tipo de stock.<br/><br/>✅ Con el producto listo, el siguiente paso es agregar un proveedor.",
          side: "left",
        },
      },
    ],
  },
  {
    path: "/proveedores",
    nextPath: "/compras",
    nextLabel: "Ir a Compras →",
    steps: [
      {
        popover: {
          title: "🛒 Proceso de compra — Paso 2 de 3",
          description:
            "Ahora necesitas tener un <b>proveedor</b> registrado para asociarlo a la orden de compra.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#provider-list-table",
        popover: {
          title: "Lista de proveedores",
          description:
            "Verifica si tu proveedor ya está registrado. Puedes editar cualquier proveedor directamente en la tabla.",
          side: "top",
        },
      },
      {
        element: "#btn-new-provider",
        popover: {
          title: "Registrar proveedor",
          description:
            "Agrega el proveedor con nombre, dirección y teléfono.<br/><br/>✅ Con el proveedor listo, ya puedes crear la orden de compra.",
          side: "left",
        },
      },
    ],
  },
  {
    path: "/compras",
    nextPath: undefined,
    steps: [
      {
        popover: {
          title: "🛒 Proceso de compra — Paso 3 de 3",
          description:
            "¡Último paso! Aquí creas la <b>orden de compra</b> que ingresará stock al sistema.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#purchase-list-table",
        popover: {
          title: "Órdenes de compra",
          description:
            "Aquí se listan todas tus compras. Al <b>aprobar</b> una compra, el stock de los productos se actualiza automáticamente.",
          side: "top",
        },
      },
      {
        element: "#btn-new-purchase",
        popover: {
          title: "Nueva orden de compra",
          description:
            "Haz clic aquí para crear una compra. Selecciona el proveedor, agrega los productos con cantidades y precios, luego apruébala para actualizar el inventario.",
          side: "left",
        },
      },
      {
        popover: {
          title: "🎉 ¡Proceso de compra completado!",
          description:
            "Ya sabes cómo:<br/>1. <b>Registrar un producto</b><br/>2. <b>Agregar un proveedor</b><br/>3. <b>Crear y aprobar una orden de compra</b><br/><br/>El stock quedará disponible en inventario para ser vendido.",
          side: "over",
          align: "center",
        },
      },
    ],
  },
];

// ── Flujo: Venta (Clientes → Ventas) ────────────────────────────────────────
export const saleProcessPhases: TourPhase[] = [
  {
    path: "/clientes",
    nextPath: "/ventas",
    nextLabel: "Ir a Ventas →",
    steps: [
      {
        popover: {
          title: "💰 Proceso de venta — Paso 1 de 2",
          description:
            "Para registrar una venta necesitas tener un <b>cliente</b> al que facturar.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#client-list-table",
        popover: {
          title: "Lista de clientes",
          description:
            "Verifica si tu cliente ya está registrado. Puedes editar sus datos directamente en la tabla.",
          side: "top",
        },
      },
      {
        element: "#btn-new-client",
        popover: {
          title: "Registrar cliente",
          description:
            "Agrega el cliente con nombre, teléfono, correo y dirección.<br/><br/>✅ Con el cliente listo, crea la orden de venta.",
          side: "left",
        },
      },
    ],
  },
  {
    path: "/ventas",
    nextPath: undefined,
    steps: [
      {
        popover: {
          title: "💰 Proceso de venta — Paso 2 de 2",
          description:
            "¡Último paso! Aquí registras la <b>venta</b> y el sistema descuenta el stock automáticamente.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#sale-list-table",
        popover: {
          title: "Órdenes de venta",
          description:
            "Historial de todas tus ventas. Puedes ver el estado, imprimir el comprobante y registrar pagos.",
          side: "top",
        },
      },
      {
        element: "#btn-new-sale",
        popover: {
          title: "Nueva venta",
          description:
            "Selecciona el cliente, el método de pago y los productos. Al aprobar la venta el stock se actualiza.",
          side: "left",
        },
      },
      {
        popover: {
          title: "🎉 ¡Proceso de venta completado!",
          description:
            "Ya sabes cómo:<br/>1. <b>Registrar un cliente</b><br/>2. <b>Crear y aprobar una orden de venta</b><br/><br/>Para ventas a crédito también puedes registrar los pagos parciales desde la lista de ventas.",
          side: "over",
          align: "center",
        },
      },
    ],
  },
];

// ── Flujo: Transferencia (Almacenes → Transferencias) ───────────────────────
export const transferProcessPhases: TourPhase[] = [
  {
    path: "/inventario/almacenes",
    nextPath: "/transferencias",
    nextLabel: "Ir a Transferencias →",
    steps: [
      {
        popover: {
          title: "🔄 Transferencias — Paso 1 de 2",
          description:
            "Para transferir productos necesitas tener al menos <b>dos almacenes</b> configurados.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#warehouse-list-table",
        popover: {
          title: "Lista de almacenes",
          description:
            "Verifica que existan al menos dos almacenes: uno de origen y otro de destino.",
          side: "top",
        },
      },
      {
        element: "#btn-new-warehouse",
        popover: {
          title: "Crear almacén",
          description:
            "Si necesitas un almacén nuevo, regístralo aquí con nombre y descripción.<br/><br/>✅ Con los almacenes listos, crea la transferencia.",
          side: "left",
        },
      },
    ],
  },
  {
    path: "/transferencias",
    nextPath: undefined,
    steps: [
      {
        popover: {
          title: "🔄 Transferencias — Paso 2 de 2",
          description:
            "Aquí gestionas el movimiento de productos entre almacenes.",
          side: "over",
          align: "center",
        },
      },
      {
        element: "#transfer-list-table",
        popover: {
          title: "Lista de transferencias",
          description:
            "Historial de todas las transferencias. Al aprobar una, el stock se mueve del almacén origen al destino.",
          side: "top",
        },
      },
      {
        element: "#btn-new-transfer",
        popover: {
          title: "Nueva transferencia",
          description:
            "Selecciona almacén origen, destino y los productos a transferir con sus cantidades. Luego apruébala.",
          side: "left",
        },
      },
      {
        popover: {
          title: "🎉 ¡Proceso de transferencia completado!",
          description:
            "Ya sabes cómo:<br/>1. <b>Configurar almacenes</b><br/>2. <b>Crear y aprobar una transferencia</b><br/><br/>El stock se moverá automáticamente entre los almacenes al aprobar.",
          side: "over",
          align: "center",
        },
      },
    ],
  },
];

// ── Motor del tour ───────────────────────────────────────────────────────────
const commonConfig = {
  showProgress: true,
  animate: true,
  overlayOpacity: 0.55,
  stagePadding: 8,
  stageRadius: 8,
  prevBtnText: "← Anterior",
  progressText: "{{current}} de {{total}}",
  popoverClass: "mymanag-tour-popover",
};

/** Waits until the first element-anchored step is in the DOM, then resolves. */
const waitForFirstElement = (steps: DriveStep[], maxMs = 4000): Promise<boolean> =>
  new Promise((resolve) => {
    const firstEl = steps.find((s) => s.element)?.element as string | undefined;
    if (!firstEl) return resolve(true);
    const start = Date.now();
    const poll = () => {
      if (document.querySelector(firstEl)) return resolve(true);
      if (Date.now() - start >= maxMs) return resolve(false);
      setTimeout(poll, 250);
    };
    poll();
  });

const launchPhase = (phase: TourPhase, navigate: (path: string) => void) => {
  const availableSteps = phase.steps.filter((step) => {
    if (!step.element) return true;
    return document.querySelector(step.element as string) !== null;
  });

  if (availableSteps.length === 0) {
    if (phase.nextPath) {
      localStorage.setItem(FULL_TOUR_KEY, phase.nextPath);
      navigate(phase.nextPath);
    } else {
      localStorage.removeItem(FULL_TOUR_KEY);
    }
    return;
  }

  let phaseCompleted = false;

  const stepsConfigured = availableSteps.map((step, index) => {
    if (index === availableSteps.length - 1 && phase.nextPath) {
      return {
        ...step,
        popover: { ...step.popover, doneBtnText: phase.nextLabel ?? "Siguiente sección →" },
      };
    }
    return step;
  });

  const driverObj = driver({
    ...commonConfig,
    nextBtnText: "Siguiente →",
    doneBtnText: "Finalizar guía",
    steps: stepsConfigured,
    onNextClick: () => {
      if (driverObj.isLastStep()) {
        phaseCompleted = true;
        driverObj.destroy();
        if (phase.nextPath) {
          localStorage.setItem(FULL_TOUR_KEY, phase.nextPath);
          setTimeout(() => navigate(phase.nextPath!), 50);
        } else {
          localStorage.removeItem(FULL_TOUR_KEY);
        }
      } else {
        driverObj.moveNext();
      }
    },
    onDestroyed: () => {
      if (!phaseCompleted) localStorage.removeItem(FULL_TOUR_KEY);
    },
  });

  driverObj.drive();
};

// ── Hook ────────────────────────────────────────────────────────────────────
export const useFullProcessTour = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const activePath = localStorage.getItem(FULL_TOUR_KEY);
    if (!activePath || activePath !== location.pathname) return;

    // Find which phase set contains this path
    const allPhaseSets = [purchaseProcessPhases, saleProcessPhases, transferProcessPhases];
    let phase: TourPhase | undefined;
    for (const phaseSet of allPhaseSets) {
      phase = phaseSet.find((p) => p.path === location.pathname);
      if (phase) break;
    }
    if (!phase) return;

    const currentPhase = phase;
    waitForFirstElement(currentPhase.steps).then((found) => {
      if (!found) {
        // Skip to next if elements never appeared
        if (currentPhase.nextPath) {
          localStorage.setItem(FULL_TOUR_KEY, currentPhase.nextPath);
          navigate(currentPhase.nextPath);
        } else {
          localStorage.removeItem(FULL_TOUR_KEY);
        }
        return;
      }
      launchPhase(currentPhase, navigate);
    });
  }, [location.pathname]);

  const startProcessTour = (phases: TourPhase[]) => {
    const firstPhase = phases[0];
    localStorage.setItem(FULL_TOUR_KEY, firstPhase.path);
    if (location.pathname === firstPhase.path) {
      // Already on the page — launch directly without navigation
      waitForFirstElement(firstPhase.steps).then((found) => {
        if (found) launchPhase(firstPhase, navigate);
        else localStorage.removeItem(FULL_TOUR_KEY);
      });
    } else {
      navigate(firstPhase.path);
    }
  };

  return {
    startPurchaseTour: () => startProcessTour(purchaseProcessPhases),
    startSaleTour: () => startProcessTour(saleProcessPhases),
    startTransferTour: () => startProcessTour(transferProcessPhases),
  };
};
