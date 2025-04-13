import { useQuery } from "@apollo/client";
import { ArcElement, Chart as ChartJS, Legend, Title, Tooltip } from "chart.js";
import { Card } from "primereact/card";
import { Chart } from "primereact/chart";
import { useEffect } from "react";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_SALE_ORDER_BY_CATEGORY } from "../../graphql/queries/Home";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";

// Registrar PieChart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ReportByCategory = () => {
  const {
    data: { reportSaleOrderByCategory: listReport } = [],
    loading: loadingSaleOrderByCategory,
    error: errorSale,
  } = useQuery(REPORT_SALE_ORDER_BY_CATEGORY, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (errorSale) {
      showToast({
        detail: errorSale.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorSale]);

  if (loadingSaleOrderByCategory) {
    return <LoadingSpinner />;
  }

  // Preparar datos
  const categoryNames = listReport.map((item: any) => item.category);
  const salesTotal = listReport.map((item: any) => item.total);

  const data = {
    labels: categoryNames,
    datasets: [
      {
        label: `Ventas por Categoría (${currencySymbol})`,
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
    <Card title="Mejores categorias" className="w-full">
      <Chart type="pie" data={data} options={options} />
    </Card>
  );
};

export default ReportByCategory;
