import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../components/labelInput/LabelInput";
import { OrderSkeleton } from "../../components/skeleton/OrderSkeleton";
import SectionHeader from "../../components/sectionHeader/SectionHeader";
import {
  APPROVE_PRODUCT_TRANSFER,
  DELETE_PRODUCT_TRANSFER,
} from "../../graphql/mutations/ProductTransfer";
import {
  FIND_PRODUCT_TRANSFER,
  LIST_PRODUCT_TRANSFER,
} from "../../graphql/queries/ProductTransfer";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { orderStatus } from "../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import { getDate } from "../order/utils/getDate";
import { getStatus } from "../order/utils/getStatus";
import { confirmDialog } from "primereact/confirmdialog";
import useAuth from "../auth/hooks/useAuth";

interface ProductTransferDetailProps {
  transferId: string;
  approveBlocked?: boolean;
}

const ProductTransferDetail: FC<ProductTransferDetailProps> = ({
  transferId,
  approveBlocked = false,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { permissions } = useAuth();

  const canDelete = permissions.includes("DELETE_TRANSFER");

  const {
    data,
    loading,
    error,
  } = useQuery(FIND_PRODUCT_TRANSFER, {
    variables: { transferId },
    fetchPolicy: "network-only",
  });

  const [approveProductTransfer] = useMutation(APPROVE_PRODUCT_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER }],
  });

  const [deleteProductTransfer] = useMutation(DELETE_PRODUCT_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER }],
  });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  const handleApprove = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data: result } = await approveProductTransfer({
        variables: { transferId },
      });
      if (result) {
        showToast({
          detail: "Transferencia aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate(`${ROUTES_MOCK.TRANSFERS}/detalle/${transferId}`);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmApprove = () => {
    confirmDialog({
      message:
        "¿Está seguro que desea aprobar esta transferencia? El stock se moverá al almacén destino.",
      header: "Aprobar transferencia",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-success",
      accept: handleApprove,
    });
  };

  const handleDelete = async () => {
    try {
      dispatch(setIsBlocked(true));
      const { data: result } = await deleteProductTransfer({
        variables: { transferId },
      });
      if (result?.deleteProductTransfer?.success) {
        showToast({
          detail: "Transferencia eliminada.",
          severity: ToastSeverity.Success,
        });
        navigate(ROUTES_MOCK.TRANSFERS);
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDelete = () => {
    confirmDialog({
      message: "¿Está seguro que desea eliminar esta transferencia?",
      header: "Confirmación",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: handleDelete,
    });
  };

  if (loading) return <OrderSkeleton />;

  const transfer = data?.findProductTransfer;
  const isBorrador = transfer?.status === orderStatus.BORRADOR;
  const date = getDate(transfer?.date) || "";

  return (
    <div className="p-5 shadow-lg rounded-lg border border-gray-200 bg-white mb-2">
      <SectionHeader
        title="Detalle de transferencia"
        subtitle="Consulta la información de la transferencia y realiza cambios si es necesario."
        actions={
          <Button
            label="Volver a la lista"
            icon="pi pi-arrow-left"
            className="p-button-outlined"
            onClick={() => navigate(ROUTES_MOCK.TRANSFERS)}
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Ruta y fecha */}
        <section className="flex flex-col gap-3 border-r md:border-r-gray-300 md:pr-6">
          <div className="flex flex-col">
            <LabelInput name="date" label="Fecha" />
            <span className="text-lg font-medium text-gray-700">{date}</span>
          </div>
          <div className="flex flex-col">
            <LabelInput name="origin" label="Almacén origen" />
            <span className="text-lg font-medium text-gray-700">
              {transfer?.origin_warehouse?.name}
            </span>
          </div>
          <div className="flex flex-col">
            <LabelInput name="destination" label="Almacén destino" />
            <span className="text-lg font-medium text-gray-700">
              {transfer?.destination_warehouse?.name}
            </span>
          </div>
        </section>

        {/* Creado por */}
        <section className="flex flex-col items-center justify-center">
          <LabelInput name="user" label="Creado por" />
          <span className="text-xl font-semibold text-gray-700">
            {transfer?.created_by?.user_name}
          </span>
        </section>

        {/* Estado y acciones */}
        <section className="flex flex-col gap-5 rounded-md">
          <div className="flex flex-col items-center gap-2 bg-gray-100 p-4 rounded-md">
            <span className="text-gray-600 text-sm">Código</span>
            <span className="text-xl font-bold text-gray-800">
              {transfer?.code}
            </span>
            <Tag
              severity={
                getStatus(transfer?.status)?.severity as
                  | "danger"
                  | "success"
                  | "info"
                  | "warning"
              }
            >
              {getStatus(transfer?.status)?.label}
            </Tag>
          </div>

          {isBorrador && (
            <div className="flex flex-col gap-2">
              <Button
                icon="pi pi-check-circle"
                type="button"
                severity="success"
                label="Aprobar transferencia"
                onClick={confirmApprove}
                disabled={approveBlocked}
                tooltip={
                  approveBlocked
                    ? "Hay productos serializados con seriales incompletos"
                    : undefined
                }
                tooltipOptions={{ position: "top" }}
              />
              {canDelete && (
                <Button
                  icon="pi pi-trash"
                  type="button"
                  severity="danger"
                  label="Eliminar transferencia"
                  outlined
                  onClick={confirmDelete}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default ProductTransferDetail;
