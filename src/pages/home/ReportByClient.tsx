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

// Función para generar un color aleatorio en formato RGBA
const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgba(${r}, ${g}, ${b}, 0.6)`; // Color con opacidad
};

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

  // Generar un color único para cada cliente
  const backgroundColors = listReport.map(() => getRandomColor());

  // Datos y opciones para el gráfico
  const data = {
    labels: clientNames,
    datasets: [
      {
        label: `Ventas por cliente (${currency})`,
        data: salesTotal,
        backgroundColor: backgroundColors, // Asignar los colores generados
        borderColor: backgroundColors.map((color: any) =>
          color.replace("0.6", "1")
        ), // Usar el mismo color con opacidad 1 para el borde
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
