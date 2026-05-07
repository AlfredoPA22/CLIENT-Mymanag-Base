import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { REPORT_SALE_ORDER_BY_MONTH } from "../../../graphql/queries/Home";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

const useReportByMonth = (startDate: Date, endDate: Date) => {
  const {
    data: { reportSaleOrderByMonth: listSaleOrder } = [],
    loading: loadingListSaleOrder,
    error,
  } = useQuery(REPORT_SALE_ORDER_BY_MONTH, {
    fetchPolicy: "network-only",
    variables: { startDate, endDate },
  });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return { listSaleOrder, loadingListSaleOrder };
};

export default useReportByMonth;
