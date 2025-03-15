import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { LIST_BRAND } from "../../../graphql/queries/Brand";

const useBrandList = () => {
  const {
    data: { listBrand: listBrand } = [],
    loading: loadingListBrand,
    error,
  } = useQuery(LIST_BRAND,{fetchPolicy: "network-only",});

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listBrand, loadingListBrand };
};

export default useBrandList;
