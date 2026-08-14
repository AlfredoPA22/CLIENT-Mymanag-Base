import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FC, useState } from "react";
import { canDoAny } from "../../../../casl/ability";
import { useAbility } from "../../../../casl/AbilityContext";
import {
  ADD_SERIAL_TO_TRANSFER_DETAIL,
  APPROVE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER_DETAIL,
} from "../../../../graphql/mutations/ProductTransfer";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";

interface ResolveSerialWarehouseModalProps {
  visible: boolean;
  onHide: () => void;
  productId: string;
  productName: string;
  serial: string;
  originWarehouseId: string;
  originWarehouseName: string;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  onResolved: () => void | Promise<void>;
}

// Se abre cuando el serial elegido (escaneado o asignado a mano) pertenece a
// un almacén distinto al de la nota. A diferencia del faltante de stock, acá
// no hace falta elegir origen ni cantidad — el serial ya identifica una
// unidad física puntual, así que solo se confirma transferir exactamente ese
// serial del almacén donde está al almacén de la nota.
const ResolveSerialWarehouseModal: FC<ResolveSerialWarehouseModalProps> = ({
  visible,
  onHide,
  productId,
  productName,
  serial,
  originWarehouseId,
  originWarehouseName,
  destinationWarehouseId,
  destinationWarehouseName,
  onResolved,
}) => {
  const ability = useAbility();
  const canResolve = canDoAny(ability, ["CREATE_TRANSFER", "EDIT_TRANSFER"]);
  const [submitting, setSubmitting] = useState(false);

  const [createProductTransfer] = useMutation(CREATE_PRODUCT_TRANSFER);
  const [createProductTransferDetail] = useMutation(CREATE_PRODUCT_TRANSFER_DETAIL);
  const [addSerialToTransferDetail] = useMutation(ADD_SERIAL_TO_TRANSFER_DETAIL);
  const [approveProductTransfer] = useMutation(APPROVE_PRODUCT_TRANSFER);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const { data: transferData } = await createProductTransfer({
        variables: {
          date: new Date().toString(),
          origin_warehouse: originWarehouseId,
          destination_warehouse: destinationWarehouseId,
        },
      });
      const transferId = transferData.createProductTransfer._id;

      const { data: detailData } = await createProductTransferDetail({
        variables: { product_transfer: transferId, product: productId, quantity: 1 },
      });

      await addSerialToTransferDetail({
        variables: {
          product_transfer_detail: detailData.createProductTransferDetail._id,
          serial,
        },
      });

      await approveProductTransfer({ variables: { transferId } });

      showToast({ detail: "Serial transferido", severity: ToastSeverity.Success });
      onHide();
      try {
        await onResolved();
      } catch (retryError: any) {
        showToast({ detail: retryError.message, severity: ToastSeverity.Error });
      }
    } catch (error: any) {
      showToast({
        detail: `${error.message} — revisá el módulo de Transferencias, puede haber quedado una transferencia a medias.`,
        severity: ToastSeverity.Error,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      header="Este serial está en otro almacén"
      visible={visible}
      onHide={onHide}
      style={{ width: "420px" }}
      breakpoints={{ "640px": "95vw" }}
    >
      {!canResolve ? (
        <p className="text-sm text-gray-600">
          El serial <strong>{serial}</strong> de {productName} está en {originWarehouseName}, no en{" "}
          {destinationWarehouseName}. Pedile a alguien con permiso de Transferencias que lo mueva a este almacén.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            El serial <strong>{serial}</strong> de {productName} está en <strong>{originWarehouseName}</strong>, no
            en {destinationWarehouseName} (el almacén de esta venta).
          </p>
          <Button
            label={`Transferir a ${destinationWarehouseName} y continuar`}
            icon="pi pi-arrow-right-arrow-left"
            severity="success"
            disabled={submitting}
            loading={submitting}
            onClick={handleConfirm}
            className="justify-center"
          />
        </div>
      )}
    </Dialog>
  );
};

export default ResolveSerialWarehouseModal;
