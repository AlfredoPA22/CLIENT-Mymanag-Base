import { Card } from "primereact/card";
import { FC } from "react";
import SearchProductForm from "../product/pages/SearchProductForm";
import HeaderHome from "./HeaderHome";

const Home: FC = () => {
  // const [chartData, setChartData] = useState({});
  // const [chartOptions, setChartOptions] = useState({});
  // const [chartData2, setChartData2] = useState({});
  // const [chartOptions2, setChartOptions2] = useState({});

  // const {
  //   data: { reportSaleOrderByYear: listSales } = [],
  //   loading: loadingListSales,
  //   error: errorSale,
  // } = useQuery(REPORT_SALE_ORDER_BY_YEAR, { fetchPolicy: "network-only" });

  // const {
  //   data: { reportPurchaseOrderByYear: listPurchases } = [],
  //   loading: loadingListPurchases,
  //   error: errorPurchase,
  // } = useQuery(REPORT_PURCHASE_ORDER_BY_YEAR, { fetchPolicy: "network-only" });

  // useEffect(() => {
  //   if (errorSale) {
  //     showToast({
  //       detail: errorSale.message,
  //       severity: ToastSeverity.Success,
  //     });
  //   }
  // }, [errorSale]);

  // useEffect(() => {
  //   if (errorPurchase) {
  //     showToast({
  //       detail: errorPurchase.message,
  //       severity: ToastSeverity.Success,
  //     });
  //   }
  // }, [errorPurchase]);

  // useEffect(() => {
  //   if (!loadingListSales && listSales) {
  //     const data = {
  //       labels: listSales.map((elem: ISaleOrderByYear) => elem.month),
  //       datasets: [
  //         {
  //           label: "Ventas por mes",
  //           data: listSales.map((elem: ISaleOrderByYear) => elem.total),
  //           backgroundColor: [
  //             "rgba(255, 159, 64, 0.2)", // Enero
  //             "rgba(75, 192, 192, 0.2)", // Febrero
  //             "rgba(54, 162, 235, 0.2)", // Marzo
  //             "rgba(153, 102, 255, 0.2)", // Abril
  //             "rgba(255, 205, 86, 0.2)", // Mayo
  //             "rgba(201, 203, 207, 0.2)", // Junio
  //             "rgba(255, 99, 132, 0.2)", // Julio
  //             "rgba(75, 192, 192, 0.2)", // Agosto
  //             "rgba(54, 162, 235, 0.2)", // Septiembre
  //             "rgba(153, 102, 255, 0.2)", // Octubre
  //             "rgba(255, 205, 86, 0.2)", // Noviembre
  //             "rgba(201, 203, 207, 0.2)", // Diciembre
  //           ],
  //           borderColor: [
  //             "rgb(255, 159, 64)", // Enero
  //             "rgb(75, 192, 192)", // Febrero
  //             "rgb(54, 162, 235)", // Marzo
  //             "rgb(153, 102, 255)", // Abril
  //             "rgb(255, 205, 86)", // Mayo
  //             "rgb(201, 203, 207)", // Junio
  //             "rgb(255, 99, 132)", // Julio
  //             "rgb(75, 192, 192)", // Agosto
  //             "rgb(54, 162, 235)", // Septiembre
  //             "rgb(153, 102, 255)", // Octubre
  //             "rgb(255, 205, 86)", // Noviembre
  //             "rgb(201, 203, 207)", // Diciembre
  //           ],
  //           borderWidth: 5,
  //         },
  //       ],
  //     };
  //     const options = {
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //         },
  //       },
  //       maintainAspectRatio: false,
  //       responsive: true,
  //     };

  //     setChartData(data);
  //     setChartOptions(options);
  //   }
  // }, [loadingListSales, listSales]);

  // useEffect(() => {
  //   if (!loadingListPurchases && listPurchases) {
  //     const data = {
  //       labels: listPurchases.map((elem: IPurchaseOrderByYear) => elem.month),
  //       datasets: [
  //         {
  //           label: "Compras por mes",
  //           data: listPurchases.map((elem: IPurchaseOrderByYear) => elem.total),
  //           backgroundColor: [
  //             "rgba(255, 159, 64, 0.2)", // Enero
  //             "rgba(75, 192, 192, 0.2)", // Febrero
  //             "rgba(54, 162, 235, 0.2)", // Marzo
  //             "rgba(153, 102, 255, 0.2)", // Abril
  //             "rgba(255, 205, 86, 0.2)", // Mayo
  //             "rgba(201, 203, 207, 0.2)", // Junio
  //             "rgba(255, 99, 132, 0.2)", // Julio
  //             "rgba(75, 192, 192, 0.2)", // Agosto
  //             "rgba(54, 162, 235, 0.2)", // Septiembre
  //             "rgba(153, 102, 255, 0.2)", // Octubre
  //             "rgba(255, 205, 86, 0.2)", // Noviembre
  //             "rgba(201, 203, 207, 0.2)", // Diciembre
  //           ],
  //           borderColor: [
  //             "rgb(255, 159, 64)", // Enero
  //             "rgb(75, 192, 192)", // Febrero
  //             "rgb(54, 162, 235)", // Marzo
  //             "rgb(153, 102, 255)", // Abril
  //             "rgb(255, 205, 86)", // Mayo
  //             "rgb(201, 203, 207)", // Junio
  //             "rgb(255, 99, 132)", // Julio
  //             "rgb(75, 192, 192)", // Agosto
  //             "rgb(54, 162, 235)", // Septiembre
  //             "rgb(153, 102, 255)", // Octubre
  //             "rgb(255, 205, 86)", // Noviembre
  //             "rgb(201, 203, 207)", // Diciembre
  //           ],
  //           borderWidth: 5,
  //         },
  //       ],
  //     };
  //     const options = {
  //       scales: {
  //         y: {
  //           beginAtZero: true,
  //         },
  //       },
  //       maintainAspectRatio: false,
  //       responsive: true,
  //     };

  //     setChartData2(data);
  //     setChartOptions2(options);
  //   }
  // }, [loadingListPurchases, listPurchases]);

  return (
    <div className="flex flex-col">
      <HeaderHome />
      <Card
        className="m-2"
        title="Buscar productos"
      >
        <SearchProductForm />
      </Card>
    </div>
    // <div className="flex sm:flex-row flex-col justify-center items-center mt-10 gap-5">
    //   <section>
    //     <h1 className="font-semibold text-2xl">Total de ventas por mes</h1>
    //     <Chart
    //       className="lg:w-[800px] w-[400px] h-[500px]"
    //       type="bar"
    //       data={chartData}
    //       options={chartOptions}
    //     />
    //   </section>

    //   <section>
    //     <h1 className="font-semibold text-2xl">Total de compras por mes</h1>
    //     <Chart
    //       className="sm:w-[800px] w-[400px] h-[500px]"
    //       type="bar"
    //       data={chartData2}
    //       options={chartOptions2}
    //     />
    //   </section>
    // </div>
  );
};

export default Home;
