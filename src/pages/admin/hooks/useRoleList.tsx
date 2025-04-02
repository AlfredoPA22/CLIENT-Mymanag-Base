import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import { LIST_ROLE } from "../../../graphql/queries/Role";

import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useRoleList = () => {
  const {
    data: { listRole: listRole } = [],
    loading: loadingListRole,
    error,
  } = useQuery(LIST_ROLE, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listRole, loadingListRole };
};

export default useRoleList;
