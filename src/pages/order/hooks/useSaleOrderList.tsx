import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_SALE_ORDER, LIST_STORE_ORDERS } from "../../../graphql/queries/SaleOrder";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useSaleOrderList = (storeOnly = false) => {
  const {
    data,
    loading: loadingListSaleOrder,
    error,
  } = useQuery(storeOnly ? LIST_STORE_ORDERS : LIST_SALE_ORDER, {
    fetchPolicy: 'network-only',
  });

  const listSaleOrder = storeOnly ? data?.listStoreOrders : data?.listSaleOrder;

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return { listSaleOrder, loadingListSaleOrder };
};

export default useSaleOrderList;
