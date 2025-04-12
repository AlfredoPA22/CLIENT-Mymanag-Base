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
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { REPORT_SALE_ORDER_BY_CLIENT } from "../../graphql/queries/Home";
import { currencySymbol } from "../../utils/constants/currencyConstants";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { showToast } from "../../utils/toastUtils";

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

const Dashboards = () => {
  const {
    data: { reportSaleOrderByClient: listReport } = [],
    loading: loadingSaleOrderByClient,
    error: errorSale,
  } = useQuery(REPORT_SALE_ORDER_BY_CLIENT, { fetchPolicy: "network-only" });

  useEffect(() => {
    if (errorSale) {
      showToast({
        detail: errorSale.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [errorSale]);

  if (loadingSaleOrderByClient) {
    return <LoadingSpinner />;
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
        label: "Ventas Totales por Cliente",
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
    plugins: {
      title: {
        display: true,
        text: "Ventas Totales por Cliente del presente año",
      },
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          // Formatear los valores con 'BS' al final
          callback: (value: any) => {
            return `${value} ${currencySymbol}`; // Sufijo "BS" para los valores en el eje Y
          },
        },
      },
    },
  };

  return (
    <Card className="w-full">
      <Bar data={data} options={options} />
    </Card>
  );
};

export default Dashboards;
