import { useQuery } from "@apollo/client";
import { LIST_PURCHASE_ORDER } from "../../../graphql/queries/PurchaseOrder";
import { useEffect } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";

const usePurchaseOrderList = () => {
  const {
    data: { listPurchaseOrder: listPurchaseOrder } = [],
    loading: loadingListPurchaseOrder,
    error,
  } = useQuery(LIST_PURCHASE_ORDER, {
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
  
  return { listPurchaseOrder, loadingListPurchaseOrder };
};

export default usePurchaseOrderList;
