import { useQuery } from "@apollo/client";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { useEffect } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";

const useCategoryList = () => {
  const {
    data: { listCategory: listCategory } = [],
    loading: loadingListCategory,
    error,
  } = useQuery(LIST_CATEGORY,{fetchPolicy: "network-only",});

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listCategory, loadingListCategory };
};

export default useCategoryList;
