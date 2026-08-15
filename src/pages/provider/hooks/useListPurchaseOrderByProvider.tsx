import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_PURCHASE_ORDER_BY_PROVIDER } from "../../../graphql/queries/PurchaseOrder";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useListPurchaseOrderByProvider = (providerId: string) => {
  const {
    data: { listPurchaseOrderByProvider: listPurchaseOrderByProvider } = [],
    loading: loadingListPurchaseOrderByProvider,
    error,
  } = useQuery(LIST_PURCHASE_ORDER_BY_PROVIDER, {
    fetchPolicy: "network-only",
    variables: { providerId },
  });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return {
    listPurchaseOrderByProvider,
    loadingListPurchaseOrderByProvider,
  };
};

export default useListPurchaseOrderByProvider;
