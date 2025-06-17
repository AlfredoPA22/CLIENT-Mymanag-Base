import { useQuery } from "@apollo/client";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useEffect } from "react";
import ReportByCategorySkeleton from "../../components/skeleton/ReportByCategorySkeleton";
import { REPORT_SALE_ORDER_BY_CATEGORY } from "../../graphql/queries/Home";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import useAuth from "../auth/hooks/useAuth";

// Registrar PieChart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ReportByCategory = () => {
  const {
    data: { reportSaleOrderByCategory: listReport } = [],
    loading: loadingSaleOrderByCategory,
    error: errorSale,
  } = useQuery(REPORT_SALE_ORDER_BY_CATEGORY, { fetchPolicy: "network-only" });

  const { currency } = useAuth();

  useEffect(() => {
    if (errorSale) {
      showToast({
        detail: errorSale.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorSale]);

  if (loadingSaleOrderByCategory) {
    return <ReportByCategorySkeleton />;
  }

  // Preparar datos
  const categoryNames = listReport.map((item: any) => item.category);
  const salesTotal = listReport.map((item: any) => item.total);

  const data = {
    labels: categoryNames,
    datasets: [
      {
        label: `Ventas por Categoría (${currency})`,
        data: salesTotal,
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom" as const,
      },
    },
  };

  return (
    <Card title="Categorías más vendidas" className="w-full">
      <Chart type="pie" data={data} options={options} />
    </Card>
  );
};

export default ReportByCategory;
