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
import { formatDateRange } from "../../utils/dateUtils";

// Registrar PieChart
ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface ICategoryReport {
  category: string;
  total: number;
}

interface ReportByCategoryProps {
  startDate: Date;
  endDate: Date;
}

const ReportByCategory = ({ startDate, endDate }: ReportByCategoryProps) => {
  const {
    data: { reportSaleOrderByCategory: listReport } = { reportSaleOrderByCategory: [] as ICategoryReport[] },
    loading: loadingSaleOrderByCategory,
    error: errorSale,
  } = useQuery(REPORT_SALE_ORDER_BY_CATEGORY, {
    fetchPolicy: "network-only",
    variables: { startDate, endDate },
  });

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

  const PALETTE = [
    "rgba(16, 185, 129, 0.8)",
    "rgba(99, 102, 241, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(14, 165, 233, 0.8)",
    "rgba(160, 200, 46, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(249, 115, 22, 0.8)",
  ];

  const categoryNames = listReport.map((item: ICategoryReport) => item.category);
  const salesTotal = listReport.map((item: ICategoryReport) => item.total);

  const data = {
    labels: categoryNames,
    datasets: [
      {
        label: `Ventas por Categoría (${currency})`,
        data: salesTotal,
        backgroundColor: listReport.map((_: ICategoryReport, i: number) => PALETTE[i % PALETTE.length]),
        borderColor: listReport.map((_: ICategoryReport, i: number) => PALETTE[i % PALETTE.length].replace("0.8", "1")),
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
    <Card
      title="Categorías más vendidas"
      subTitle={formatDateRange(startDate, endDate)}
      className="w-full"
    >
      <Chart type="pie" data={data} options={options} />
    </Card>
  );
};

export default ReportByCategory;
