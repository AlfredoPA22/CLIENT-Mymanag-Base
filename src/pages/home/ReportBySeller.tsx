import { useQuery } from "@apollo/client";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ReportByClientSkeleton from "../../components/skeleton/ReportByClientSkeleton";
import { REPORT_SALE_ORDER_BY_SELLER } from "../../graphql/queries/Home";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import useAuth from "../auth/hooks/useAuth";
import { formatDateRange } from "../../utils/dateUtils";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PALETTE = [
  "rgba(99, 102, 241, 0.75)",
  "rgba(16, 185, 129, 0.75)",
  "rgba(14, 165, 233, 0.75)",
  "rgba(245, 158, 11, 0.75)",
  "rgba(168, 85, 247, 0.75)",
  "rgba(160, 200, 46, 0.75)",
  "rgba(249, 115, 22, 0.75)",
  "rgba(239, 68, 68, 0.75)",
  "rgba(20, 184, 166, 0.75)",
  "rgba(236, 72, 153, 0.75)",
];

interface ISellerReport {
  seller: string;
  total: number;
}

interface ReportBySellerProps {
  startDate: Date;
  endDate: Date;
}

const ReportBySeller = ({ startDate, endDate }: ReportBySellerProps) => {
  const { currency } = useAuth();

  const {
    data: { reportSaleOrderBySeller: listReport } = { reportSaleOrderBySeller: [] as ISellerReport[] },
    loading,
    error,
  } = useQuery(REPORT_SALE_ORDER_BY_SELLER, {
    variables: { startDate, endDate },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  if (loading) return <ReportByClientSkeleton />;

  const sellerNames = listReport.map((item: ISellerReport) => item.seller);
  const salesTotal = listReport.map((item: ISellerReport) => item.total);
  const backgroundColors = listReport.map((_: ISellerReport, i: number) => PALETTE[i % PALETTE.length]);

  const chartData = {
    labels: sellerNames,
    datasets: [
      {
        label: `Ventas (${currency})`,
        data: salesTotal,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map((c: string) => c.replace("0.75", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y" as const,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { callback: (value: number | string) => `${value} ${currency}` },
      },
    },
  };

  return (
    <div className="p-5 shadow-sm rounded-lg border border-gray-200 bg-white flex flex-col gap-3">
      <div>
        <h2 className="text-base font-semibold text-slate-800">Top 10 vendedores</h2>
        <p className="text-xs text-slate-400 mt-0.5">{formatDateRange(startDate, endDate)}</p>
      </div>
      {listReport.length === 0 ? (
        <p className="text-sm text-slate-400">Sin datos en el período seleccionado.</p>
      ) : (
        <Bar data={chartData} options={options} />
      )}
    </div>
  );
};

export default ReportBySeller;
