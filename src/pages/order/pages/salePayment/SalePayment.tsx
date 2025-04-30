import { useParams } from "react-router-dom";
import useDetailSalePaymentBySaleOrder from "../../hooks/useDetailSalePaymentBySaleOrder";
import useSalePaymentBySaleOrderList from "../../hooks/useSalePaymentBySaleOrderList";
import SalePaymentHeaderDetail from "./SalePaymentHeaderDetail";
import SalePaymentList from "./SalePaymentList";

const SalePayment = () => {
  const { id } = useParams();
  const saleOrderId: string = id || "";

  const { listSalePayment, loadingListSalePayment } =
    useSalePaymentBySaleOrderList(saleOrderId);

  const { detailSalePaymentBySaleOrder, loadingDetailSalePayment } =
    useDetailSalePaymentBySaleOrder(saleOrderId);

  return (
    <div className="size-full">
      <SalePaymentHeaderDetail
        detailSalePayment={
          detailSalePaymentBySaleOrder?.detailSalePaymentBySaleOrder
        }
        loadingDetailSalePayment={loadingDetailSalePayment}
      />

      <SalePaymentList
        detailSalePayment={
          detailSalePaymentBySaleOrder?.detailSalePaymentBySaleOrder
        }
        loadingDetailSalePayment={loadingDetailSalePayment}
        listSalePayment={listSalePayment}
        loadingSalePayment={loadingListSalePayment}
        saleOrderId={saleOrderId}
      />
    </div>
  );
};

export default SalePayment;
