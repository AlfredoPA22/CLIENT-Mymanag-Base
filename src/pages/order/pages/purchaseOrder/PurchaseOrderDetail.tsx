import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import LabelInput from "../../../../components/labelInput/LabelInput";
import {
  FIND_PURCHASE_ORDER,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { APPROVE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import { useNavigate } from "react-router-dom";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";

interface PurchaseOrderDetailProps {
  purchaseOrderId: string;
}

const PurchaseOrderDetail: FC<PurchaseOrderDetailProps> = ({
  purchaseOrderId,
}) => {
  const {
    data,
    loading: loadingPurchaseOrder,
    error: errorPurchaseOrder,
  } = useQuery(FIND_PURCHASE_ORDER, {
    variables: { purchaseOrderId },
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();

  const [approvePurchaseOrder] = useMutation(APPROVE_PURCHASE_ORDER, {
    refetchQueries: [{ query: LIST_PURCHASE_ORDER }, { query: LIST_PRODUCT }],
  });

  const setApprovePurchaseOrder = async () => {
    try {
      const { data } = await approvePurchaseOrder({
        variables: { purchaseOrderId },
      });
      if (data) {
        showToast({
          detail: "Compra Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate("/order/purchaseOrder");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  useEffect(() => {
    if (errorPurchaseOrder) {
      showToast({
        detail: errorPurchaseOrder.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorPurchaseOrder]);

  const date = getDate(data?.findPurchaseOrder.date) || "";

  if(loadingPurchaseOrder){
    return <LoadingSpinner/>
  }

  return (
    <Card className="flex flex-col mb-2">
        <div className="flex md:flex-row flex-col justify-between items-center gap-10">
          <section className="md:flex grid grid-cols-2 justify-center items-end gap-10">
            <div className="flex flex-col gap-2">
              <LabelInput name="date" label="Fecha de compra" />
              {date}
            </div>
            <div className="flex flex-col gap-2">
              <LabelInput name="provider" label="Proveedor" />
              {data?.findPurchaseOrder.provider.name}
            </div>
          </section>
          <section className="flex flex-col justify-center items-center gap-2">
            <LabelInput name="date" label="Total de compra" />
            {data?.findPurchaseOrder.total} {currencySymbol}
          </section>
          <section className="flex justify-start items-start">
            <div className="flex flex-col gap-2 items-center justify-center">
              <span className="text-2xl font-bold">
                {data?.findPurchaseOrder.code}
              </span>
              {data?.findPurchaseOrder.status &&
              data?.findPurchaseOrder.status === orderStatus.APROBADO ? (
                <Tag
                  severity={
                    getStatus(data?.findPurchaseOrder.status)?.severity as
                      | "danger"
                      | "success"
                      | "info"
                      | "warning"
                  }
                >
                  {getStatus(data?.findPurchaseOrder.status)?.label}
                </Tag>
              ) : (
                <>
                  <Tag
                    severity={
                      getStatus(data?.findPurchaseOrder.status)?.severity as
                        | "danger"
                        | "success"
                        | "info"
                        | "warning"
                    }
                  >
                    {getStatus(data?.findPurchaseOrder.status)?.label}
                  </Tag>
                  <Button
                    icon="pi pi-check-circle"
                    type="button"
                    severity="success"
                    label="Aprobar compra"
                    onClick={setApprovePurchaseOrder}
                  />
                </>
              )}
            </div>
          </section>
        </div>
    </Card>
  );
};

export default PurchaseOrderDetail;
