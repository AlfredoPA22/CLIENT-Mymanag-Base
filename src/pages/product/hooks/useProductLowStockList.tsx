import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_LOW_STOCK_PRODUCT } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useProductLowStockList = () => {
  const {
    data: { listLowStockProduct: listLowStockProduct } = [],
    loading: loadingListProduct,
    error,
  } = useQuery(LIST_LOW_STOCK_PRODUCT, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return {
    listLowStockProduct,
    loadingListProduct,
  };
};

export default useProductLowStockList;
