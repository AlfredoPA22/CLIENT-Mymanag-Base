import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_PRODUCT_TRANSFER } from "../../../graphql/queries/ProductTransfer";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useProductTransferList = () => {
  const {
    data: { listProductTransfer: listProductTransfer } = [],
    loading: loadingListProductTransfer,
    error,
  } = useQuery(LIST_PRODUCT_TRANSFER, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  return { listProductTransfer, loadingListProductTransfer };
};

export default useProductTransferList;
