import { Button } from "primereact/button";

export interface RowAction {
  label: string;
  icon: string;
  onClick: () => void;
  severity?: "info" | "warning" | "success" | "danger" | "secondary";
}

interface RowActionButtonsProps {
  actions: RowAction[];
  size?: "small";
}

// Botones de acción de una fila, compactos y en una fila que se envuelve si
// no entran todos — para que varias acciones juntas no se vean apretadas ni
// se corten, sin ocultarlas detrás de un menú.
const RowActionButtons = ({ actions, size = "small" }: RowActionButtonsProps) => {
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center justify-center gap-1">
      {actions.map((action) => (
        <Button
          key={action.label}
          icon={action.icon}
          tooltip={action.label}
          tooltipOptions={{ position: "top" }}
          raised
          size={size}
          severity={action.severity ?? "secondary"}
          onClick={action.onClick}
        />
      ))}
    </div>
  );
};

export default RowActionButtons;
