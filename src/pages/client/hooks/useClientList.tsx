import { useQuery } from "@apollo/client";
import { LIST_CLIENT } from "../../../graphql/queries/Client";
import { useEffect } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";

const useClientList = () => {
  const {
    data: { listClient: listClient } = [],
    loading: loadingListClient,
    error,
  } = useQuery(LIST_CLIENT,{fetchPolicy: "network-only",});

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listClient, loadingListClient };
};

export default useClientList;
