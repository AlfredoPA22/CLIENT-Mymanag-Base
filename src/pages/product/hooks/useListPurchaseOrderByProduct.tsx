import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_PURCHASE_ORDER_BY_PRODUCT } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useListPurchaseOrderByProduct = (productId: string) => {
  const {
    data: { listPurchaseOrderByProduct: listPurchaseOrderByProduct } = [],
    loading: loadingListProduct,
    error,
  } = useQuery(LIST_PURCHASE_ORDER_BY_PRODUCT, {
    fetchPolicy: "network-only",
    variables: { productId },
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
    listPurchaseOrderByProduct,
    loadingListProduct,
  };
};

export default useListPurchaseOrderByProduct;
