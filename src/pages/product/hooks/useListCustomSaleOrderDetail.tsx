import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_CUSTOM_SALE_ORDER_DETAIL } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useListCustomSaleOrderDetail = () => {
  const {
    data: { listCustomSaleOrderDetail: listCustomSaleOrderDetail } = [],
    loading: loadingListCustomSaleOrderDetail,
    error,
  } = useQuery(LIST_CUSTOM_SALE_ORDER_DETAIL, {
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [error]);

  return {
    listCustomSaleOrderDetail,
    loadingListCustomSaleOrderDetail,
  };
};

export default useListCustomSaleOrderDetail;
