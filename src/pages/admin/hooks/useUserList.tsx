import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import { LIST_USER } from "../../../graphql/queries/User";

import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useUserList = () => {
  const {
    data: { listUser: listUser } = [],
    loading: loadingListUser,
    error,
  } = useQuery(LIST_USER, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listUser, loadingListUser };
};

export default useUserList;
