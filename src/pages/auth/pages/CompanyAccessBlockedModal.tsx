import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FC } from "react";
import { CompanyAccessBlockedReason } from "../hooks/useAuth";

const ADMIN_WHATSAPP_NUMBER = "59169040342";
const LANDING_LOGIN_URL = "https://inventasys.vercel.app";

interface CompanyAccessBlockedModalProps {
  reason: CompanyAccessBlockedReason;
  onClose: () => void;
}

const CONTENT: Record<
  Exclude<CompanyAccessBlockedReason, null>,
  {
    title: string;
    icon: string;
    description: string;
    whatsappMessage: string;
    canRenewOnLanding: boolean;
  }
> = {
  expired: {
    title: "Tu suscripción venció",
    icon: "pi pi-calendar-times",
    description:
      "El acceso a tu empresa está bloqueado porque la suscripción venció. Puedes renovarla tú mismo desde la plataforma, o contactar a un administrador.",
    whatsappMessage:
      "Hola, la suscripción de mi empresa en Inventasys venció y quiero renovarla.",
    canRenewOnLanding: true,
  },
  suspended: {
    title: "Tu empresa está suspendida",
    icon: "pi pi-ban",
    description:
      "El acceso a tu empresa fue suspendido por un administrador. Contáctanos para resolver la situación y reactivar el acceso.",
    whatsappMessage:
      "Hola, mi empresa en Inventasys aparece suspendida y quiero resolverlo.",
    canRenewOnLanding: false,
  },
};

const CompanyAccessBlockedModal: FC<CompanyAccessBlockedModalProps> = ({
  reason,
  onClose,
}) => {
  if (!reason) return null;

  const { title, icon, description, whatsappMessage, canRenewOnLanding } =
    CONTENT[reason];
  const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <Dialog
      visible={!!reason}
      onHide={onClose}
      header={title}
      className="w-[95vw] md:w-[30rem]"
      modal
    >
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <i className={`${icon} text-3xl text-red-500`} />
        </div>

        <p className="text-[#103953] text-base">{description}</p>

        {canRenewOnLanding && (
          <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              Opción 1: renueva tú mismo desde la plataforma
            </p>
            <Button
              label="Renovar en la plataforma"
              icon="pi pi-refresh"
              severity="info"
              className="w-full"
              onClick={() => window.open(LANDING_LOGIN_URL, "_blank")}
            />
          </div>
        )}

        <div className="w-full border-t border-gray-100 pt-4 flex flex-col gap-2">
          <p className="text-sm text-gray-500">
            {canRenewOnLanding
              ? "Opción 2: escríbenos al administrador"
              : "Escríbenos al administrador para resolverlo:"}
          </p>
          <Button
            label="Contactar por WhatsApp"
            icon="pi pi-whatsapp"
            severity="success"
            className="w-full"
            onClick={() => window.open(whatsappUrl, "_blank")}
          />
          <span className="text-xs text-gray-400">+591 69040342</span>
        </div>

        <Button
          label="Cerrar"
          text
          className="w-full"
          onClick={onClose}
        />
      </div>
    </Dialog>
  );
};

export default CompanyAccessBlockedModal;
