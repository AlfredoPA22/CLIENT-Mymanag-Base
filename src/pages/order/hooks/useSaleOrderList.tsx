import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_SALE_ORDER } from "../../../graphql/queries/SaleOrder";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useSaleOrderList = () => {
  const {
    data: { listSaleOrder: listSaleOrder } = [],
    loading: loadingListSaleOrder,
    error,
  } = useQuery(LIST_SALE_ORDER, {
    fetchPolicy: 'network-only',
  });

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
