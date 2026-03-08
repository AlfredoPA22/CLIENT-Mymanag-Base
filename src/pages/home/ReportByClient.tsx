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
import { Card } from "primereact/card";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ReportByClientSkeleton from "../../components/skeleton/ReportByClientSkeleton";
import { REPORT_SALE_ORDER_BY_CLIENT } from "../../graphql/queries/Home";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";
import useAuth from "../auth/hooks/useAuth";

// Registrar los tipos de gráficos
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PALETTE = [
  "rgba(16, 185, 129, 0.75)",
  "rgba(99, 102, 241, 0.75)",
  "rgba(245, 158, 11, 0.75)",
  "rgba(14, 165, 233, 0.75)",
  "rgba(160, 200, 46, 0.75)",
  "rgba(239, 68, 68, 0.75)",
  "rgba(168, 85, 247, 0.75)",
  "rgba(249, 115, 22, 0.75)",
];

const ReportByClient = () => {
  const {
    data: { reportSaleOrderByClient: listReport } = [],
    loading: loadingSaleOrderByClient,
    error: errorSale,
  } = useQuery(REPORT_SALE_ORDER_BY_CLIENT, { fetchPolicy: "network-only" });

  const { currency } = useAuth();

  useEffect(() => {
    if (errorSale) {
      showToast({
        detail: errorSale.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [errorSale]);

  if (loadingSaleOrderByClient) {
    return <ReportByClientSkeleton />;
  }

  // Extraer los datos para el gráfico
  const clientNames = listReport.map((item: any) => item.client);
  const salesTotal = listReport.map((item: any) => item.total);

  const backgroundColors = listReport.map(
    (_: any, i: number) => PALETTE[i % PALETTE.length]
  );

  // Datos y opciones para el gráfico
  const data = {
    labels: clientNames,
    datasets: [
      {
        label: `Ventas por cliente (${currency})`,
        data: salesTotal,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map((c: string) => c.replace("0.75", "1")),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: "y" as const, // 👈 Esto hace que las barras sean horizontales
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      x: {
        // 👈 ahora 'x' es el eje de los valores (antes era 'y')
        beginAtZero: true,
        ticks: {
          callback: (value: any) => {
            return `${value} ${currency}`;
          },
        },
      },
    },
  };

  return (
    <Card title="Mejores clientes" className="w-full">
      <Bar data={data} options={options} />
    </Card>
  );
};

export default ReportByClient;
