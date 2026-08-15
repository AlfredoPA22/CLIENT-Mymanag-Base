import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { FC, useEffect, useState } from "react";
import { AutoCompleteChangeEvent } from "primereact/autocomplete";
import { canDoAny } from "../../../../casl/ability";
import { useAbility } from "../../../../casl/AbilityContext";
import DropdownInput from "../../../../components/dropdownInput/DropdownInput";
import FieldTextInput from "../../../../components/textInput/FieldTextInput";
import {
  APPROVE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER,
  CREATE_PRODUCT_TRANSFER_DETAIL,
} from "../../../../graphql/mutations/ProductTransfer";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { IProduct } from "../../../../utils/interfaces/Product";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import useWarehouseList from "../../../product/hooks/useWarehouseList";

interface ResolveStockShortageModalProps {
  visible: boolean;
  onHide: () => void;
  product: IProduct | null;
  neededQuantity: number;
  destinationWarehouseId: string;
  destinationWarehouseName: string;
  onResolved: () => void | Promise<void>;
}

// Se abre cuando falta stock del producto en el almacén de la nota — en vez
// de un error crudo, ofrece crear (y si hay permiso, aprobar de una) una
// transferencia desde otro almacén, sin salir de la venta.
const ResolveStockShortageModal: FC<ResolveStockShortageModalProps> = ({
  visible,
  onHide,
  product,
  neededQuantity,
  destinationWarehouseId,
  destinationWarehouseName,
  onResolved,
}) => {
  const ability = useAbility();
  const canResolve = canDoAny(ability, ["CREATE_TRANSFER", "EDIT_TRANSFER"]);
  const { listWarehouse } = useWarehouseList();
  const originOptions = (listWarehouse ?? []).filter((w: IWarehouse) => w._id !== destinationWarehouseId);

  const [selectedOrigin, setSelectedOrigin] = useState<IWarehouse | null>(null);
  const [quantity, setQuantity] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Precarga la cantidad sugerida cada vez que se abre para un faltante
  // nuevo — antes arrancaba vacío (solo como placeholder), lo que hacía más
  // fácil transferir de menos por error de tipeo.
  useEffect(() => {
    if (visible) setQuantity(neededQuantity > 0 ? String(neededQuantity) : "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, neededQuantity]);

  const [createProductTransfer] = useMutation(CREATE_PRODUCT_TRANSFER);
  const [createProductTransferDetail] = useMutation(CREATE_PRODUCT_TRANSFER_DETAIL);
  const [approveProductTransfer] = useMutation(APPROVE_PRODUCT_TRANSFER);

  const handleClose = () => {
    setSelectedOrigin(null);
    setQuantity("");
    onHide();
  };

  const handleOriginChange = (e: AutoCompleteChangeEvent) => {
    const { value } = e.target;
    setSelectedOrigin(value ? value : null);
  };

  const handleConfirm = async () => {
    if (!product || !selectedOrigin || !quantity || Number(quantity) <= 0) return;
    try {
      setSubmitting(true);
      const { data: transferData } = await createProductTransfer({
        variables: {
          date: new Date().toString(),
          origin_warehouse: selectedOrigin._id,
          destination_warehouse: destinationWarehouseId,
        },
      });
      const transferId = transferData.createProductTransfer._id;

      await createProductTransferDetail({
        variables: {
          product_transfer: transferId,
          product: product._id,
          quantity: Number(quantity),
        },
      });

      await approveProductTransfer({ variables: { transferId } });

      showToast({ detail: "Transferencia creada y aprobada", severity: ToastSeverity.Success });
      handleClose();
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
      header="Falta stock en este almacén"
      visible={visible}
      onHide={handleClose}
      style={{ width: "450px" }}
      breakpoints={{ "640px": "95vw" }}
    >
      {!canResolve ? (
        <p className="text-sm text-gray-600">
          No hay suficiente stock de <strong>{product?.name}</strong> en {destinationWarehouseName}. Pedile a
          alguien con permiso de Transferencias que mueva stock a este almacén.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-gray-600">
            No hay suficiente stock de <strong>{product?.name}</strong> en {destinationWarehouseName}. Traé lo que
            falta desde otro almacén — se crea y aprueba la transferencia al toque.
          </p>
          <DropdownInput
            label="Almacén origen"
            name="origin_warehouse"
            optionLabel="name"
            placeholder="Seleccionar almacén"
            filter
            mandatory
            options={originOptions}
            value={selectedOrigin}
            onChange={handleOriginChange}
          />
          <FieldTextInput
            label="Cantidad a transferir"
            type="number"
            name="quantity"
            mandatory
            placeholder={`Ej: ${neededQuantity}`}
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
          <Button
            label="Transferir y continuar"
            icon="pi pi-arrow-right-arrow-left"
            severity="success"
            disabled={!selectedOrigin || !quantity || Number(quantity) <= 0 || submitting}
            loading={submitting}
            onClick={handleConfirm}
            className="justify-center"
          />
        </div>
      )}
    </Dialog>
  );
};

export default ResolveStockShortageModal;
