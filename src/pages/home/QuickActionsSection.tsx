import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { useAbility } from "../../casl/AbilityContext";
import { canDoAny } from "../../casl/ability";
import { ROUTES_MOCK } from "../../routes/RouteMocks";

type ButtonSeverity = "success" | "info" | "warning" | "help" | "secondary" | "contrast";

interface QuickAction {
  icon: string;
  label: string;
  permissions: string[];
  path: string;
  severity: ButtonSeverity;
}

// Set fijo y curado de los accesos más usados — no configurable por usuario
// a propósito, para no sumar la complejidad de guardar preferencias por muy
// poco beneficio en una app de este tamaño.
const QUICK_ACTIONS: QuickAction[] = [
  {
    icon: "pi-shopping-cart",
    label: "Nueva venta",
    permissions: ["CREATE_SALE"],
    path: `${ROUTES_MOCK.SALE_ORDERS}${ROUTES_MOCK.NEW_SALE_ORDER}`,
    severity: "success",
  },
  {
    icon: "pi-truck",
    label: "Nueva compra",
    permissions: ["CREATE_PURCHASE"],
    path: `${ROUTES_MOCK.PURCHASE_ORDERS}${ROUTES_MOCK.NEW_PURCHASE_ORDER}`,
    severity: "info",
  },
  {
    icon: "pi-box",
    label: "Nuevo producto",
    permissions: ["CREATE_PRODUCT"],
    path: `${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}`,
    severity: "warning",
  },
  {
    icon: "pi-user-plus",
    label: "Nuevo cliente",
    permissions: ["CREATE_CLIENT"],
    path: ROUTES_MOCK.CLIENTS,
    severity: "help",
  },
  {
    icon: "pi-wallet",
    label: "Caja",
    permissions: ["LIST_CASH_REGISTER", "OPEN_CASH_REGISTER"],
    path: ROUTES_MOCK.CASH_REGISTER,
    severity: "contrast",
  },
  {
    icon: "pi-sync",
    label: "Nueva transferencia",
    permissions: ["CREATE_TRANSFER"],
    path: `${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.NEW_TRANSFER}`,
    severity: "secondary",
  },
];

const QuickActionsSection = () => {
  const navigate = useNavigate();
  const ability = useAbility();

  const visibleActions = QUICK_ACTIONS.filter((action) => canDoAny(ability, action.permissions));

  if (visibleActions.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 flex flex-col gap-3">
      <h2 className="text-sm font-bold text-slate-800">Acciones rápidas</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {visibleActions.map((action) => (
          <Button
            key={action.label}
            icon={`pi ${action.icon}`}
            label={action.label}
            severity={action.severity}
            iconPos="top"
            raised
            onClick={() => navigate(action.path)}
            className="w-full !py-3 text-xs"
          />
        ))}
      </div>
    </div>
  );
};

export default QuickActionsSection;
