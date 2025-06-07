import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_SALE_ORDER_BY_PRODUCT } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useListSaleOrderByProduct = (productId: string) => {
  const {
    data: { listSaleOrderByProduct: listSaleOrderByProduct } = [],
    loading: loadingListProduct,
    error,
  } = useQuery(LIST_SALE_ORDER_BY_PRODUCT, {
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
    listSaleOrderByProduct,
    loadingListProduct,
  };
};

export default useListSaleOrderByProduct;
