import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_SALE_PAYMENT_BY_SALE_ORDER } from "../../../graphql/queries/SalePayment";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useSalePaymentBySaleOrderList = (saleOrderId: string) => {
  const {
    data: { listSalePaymentBySaleOrder: listSalePayment } = [],
    loading: loadingListSalePayment,
    error,
  } = useQuery(LIST_SALE_PAYMENT_BY_SALE_ORDER, {
    variables: {
      saleOrderId,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return { listSalePayment, loadingListSalePayment };
};

export default useSalePaymentBySaleOrderList;
