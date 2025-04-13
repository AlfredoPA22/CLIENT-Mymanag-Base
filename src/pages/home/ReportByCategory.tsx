import { useQuery } from "@apollo/client";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Card } from "primereact/card";
import { useEffect } from "react";
import { Pie } from "react-chartjs-2";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_SALE_ORDER_BY_CATEGORY } from "../../graphql/queries/Home";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import { Chart } from "primereact/chart";

// Registrar PieChart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Función para generar color aleatorio
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 0.6)`;
};

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
