import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_PROVIDER } from "../../../graphql/queries/Provider";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useProviderList = () => {
  const {
    data: { listProvider: listProvider } = [],
    loading: loadingListProvider,
    error,
  } = useQuery(LIST_PROVIDER, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listProvider, loadingListProvider };
};

export default useProviderList;
