import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { FC, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { APPROVE_SALE_ORDER } from "../../../../graphql/mutations/SaleOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_SALE_ORDER,
  LIST_SALE_ORDER,
} from "../../../../graphql/queries/SaleOrder";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";

interface SaleOrderDetailProps {
  saleOrderId: string;
}

const SaleOrderDetail: FC<SaleOrderDetailProps> = ({ saleOrderId }) => {
  const {
    data,
    loading: loadingSaleOrder,
    error: errorSaleOrder,
  } = useQuery(FIND_SALE_ORDER, {
    variables: { saleOrderId },
    fetchPolicy: "network-only",
  });

  const navigate = useNavigate();

  const [approveSaleOrder] = useMutation(APPROVE_SALE_ORDER, {
    refetchQueries: [{ query: LIST_SALE_ORDER }, { query: LIST_PRODUCT }],
  });

  const setApproveSaleOrder = async () => {
    try {
      const { data } = await approveSaleOrder({
        variables: { saleOrderId },
      });
      if (data) {
        showToast({
          detail: "Venta Aprobada exitosamente",
          severity: ToastSeverity.Success,
        });
        navigate("/order/saleOrder");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  useEffect(() => {
    if (errorSaleOrder) {
      showToast({
        detail: errorSaleOrder.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorSaleOrder]);

  const date = getDate(data?.findSaleOrder.date) || "";

  return (
    <Card className="flex flex-col m-2">
      {loadingSaleOrder ? (
        "cargando"
      ) : (
        <div className="flex md:flex-row flex-col justify-between items-center gap-10">
          <section className="md:flex grid *:justify-center items-end gap-10">
            <div>
              <LabelInput name="date" label="Fecha de venta" />
              <Tag value={date} severity={"info"} className="text-xl" />
            </div>
            <div>
              <LabelInput name="client" label="Cliente" />
              <Tag
                value={`${data?.findSaleOrder.client.firstName} ${data?.findSaleOrder.client.lastName}`}
                severity={"info"}
                className="text-xl"
              />
            </div>
          </section>
          <section className="flex flex-col justify-center items-center gap-2">
            <LabelInput name="date" label="Total de venta: " />
            <Tag
              value={`${data?.findSaleOrder.total} ${currencySymbol}`}
              severity={"info"}
              className="text-xl"
            />
          </section>
          <section className="flex justify-start items-start">
            <div className="flex flex-col gap-2 items-center justify-center">
              <span className="text-2xl font-bold">
                {data?.findSaleOrder.code}
              </span>
              {data?.findSaleOrder.status &&
              data?.findSaleOrder.status === orderStatus.APROBADO ? (
                <Tag
                  severity={
                    getStatus(data?.findSaleOrder.status)?.severity as
                      | "danger"
                      | "success"
                      | "info"
                      | "warning"
                  }
                >
                  {getStatus(data?.findSaleOrder.status)?.label}
                </Tag>
              ) : (
                <>
                  <Tag
                    severity={
                      getStatus(data?.findSaleOrder.status)?.severity as
                        | "danger"
                        | "success"
                        | "info"
                        | "warning"
                    }
                  >
                    {getStatus(data?.findSaleOrder.status)?.label}
                  </Tag>
                  <Button
                    icon="pi pi-check-circle"
                    type="button"
                    severity="success"
                    label="Aprobar venta"
                    onClick={setApproveSaleOrder}
                  />
                </>
              )}
            </div>
          </section>
        </div>
      )}
    </Card>
  );
};

export default SaleOrderDetail;
