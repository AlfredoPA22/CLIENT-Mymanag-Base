import { ReactNode } from "react";

import { confirmDialog } from "primereact/confirmdialog";

export const confirmDialogAction = (
  message: string | ReactNode,
  onAccept: () => void
) => {
  confirmDialog({
    message: message,
    header: "Confirmar accion",
    icon: "pi pi-info-circle",
    // TODO: remove comment if you update version of primereact
    // defaultFocus: 'reject',
    acceptClassName: "p-button-danger",
    rejectClassName: "p-button-info",
    draggable: false,
    accept: onAccept,
  });
};
