import { useQuery } from "@apollo/client";
import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Filler,
} from "chart.js";
import { useEffect } from "react";
import { Line } from "react-chartjs-2";
import ReportByClientSkeleton from "../../components/skeleton/ReportByClientSkeleton";
import { REPORT_MONTHLY_SALES } from "../../graphql/queries/Home";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import useAuth from "../auth/hooks/useAuth";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const ReportMonthlySales = () => {
  const { currency } = useAuth();
  const currentYear = new Date().getFullYear();

  const {
    data: { reportMonthlySales: listReport } = { reportMonthlySales: [] },
    loading,
    error,
  } = useQuery(REPORT_MONTHLY_SALES, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loading) return <ReportByClientSkeleton />;

  const labels = listReport.map((item: any) => item.month);
  const totals = listReport.map((item: any) => item.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: `Ventas (${currency})`,
        data: totals,
        borderColor: "rgba(160, 200, 46, 1)",
        backgroundColor: "rgba(160, 200, 46, 0.12)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(160, 200, 46, 1)",
        pointRadius: 4,
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.parsed.y.toLocaleString("es-ES", { minimumFractionDigits: 2 })} ${currency}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value: any) => `${value} ${currency}` },
      },
    },
  };

  return (
    <div className="p-4 shadow-sm rounded-lg border border-gray-200 bg-white flex flex-col gap-2 h-full">
      <h2 className="text-sm font-semibold text-slate-800">
        Tendencia de ventas {currentYear}
      </h2>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ReportMonthlySales;
