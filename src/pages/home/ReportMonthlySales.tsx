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
import { formatAmount } from "../../utils/currency";
import { formatDateRange } from "../../utils/dateUtils";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend, Filler);

interface IMonthlyReport {
  month: string;
  total: number;
}

interface ReportMonthlySalesProps {
  startDate: Date;
  endDate: Date;
}

const ReportMonthlySales = ({ startDate, endDate }: ReportMonthlySalesProps) => {
  const { currency } = useAuth();

  const {
    data: { reportMonthlySales: listReport } = { reportMonthlySales: [] as IMonthlyReport[] },
    loading,
    error,
  } = useQuery(REPORT_MONTHLY_SALES, {
    fetchPolicy: "network-only",
    variables: { startDate, endDate },
  });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loading) return <ReportByClientSkeleton />;

  const labels = listReport.map((item: IMonthlyReport) => item.month);
  const totals = listReport.map((item: IMonthlyReport) => item.total);

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
          label: (ctx: { parsed: { y: number } }) =>
            ` ${formatAmount(ctx.parsed.y)} ${currency}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: (value: number | string) => `${formatAmount(Number(value))} ${currency}` },
      },
    },
  };

  return (
    <div className="p-4 shadow-sm rounded-lg border border-gray-200 bg-white flex flex-col gap-2 h-full">
      <div>
        <h2 className="text-sm font-semibold text-slate-800">Tendencia de ventas</h2>
        <p className="text-xs text-slate-400 mt-0.5">{formatDateRange(startDate, endDate)}</p>
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default ReportMonthlySales;
