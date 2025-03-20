import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { GENERAL_DATA } from "../../../graphql/queries/Home";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useGeneralData = () => {
  const {
    data: { generalData: generalData } = [],
    loading: loadingGeneralData,
    error,
  } = useQuery(GENERAL_DATA, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { generalData, loadingGeneralData };
};

export default useGeneralData;
