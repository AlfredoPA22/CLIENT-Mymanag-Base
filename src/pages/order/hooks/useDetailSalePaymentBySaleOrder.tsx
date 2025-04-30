import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import { DETAIL_SALE_PAYMENT_BY_SALE_ORDER } from "../../../graphql/queries/SalePayment";

import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useDetailSalePaymentBySaleOrder = (saleOrderId: string) => {
  const {
    data: detailSalePaymentBySaleOrder,
    loading: loadingDetailSalePayment,
    error,
  } = useQuery(DETAIL_SALE_PAYMENT_BY_SALE_ORDER, {
    variables: { saleOrderId },
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

  return { detailSalePaymentBySaleOrder, loadingDetailSalePayment };
};

export default useDetailSalePaymentBySaleOrder;
