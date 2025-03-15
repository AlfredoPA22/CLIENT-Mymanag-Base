import { Card } from "primereact/card";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { RootState } from "../../../../redux/store";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";
import SaleOrderForm from "./SaleOrderForm";

const CreateSaleOrder = () => {
  const dispatch = useDispatch();

  const { saleOrderInitialized, saleOrderData } = useSelector(
    (state: RootState) => state.saleOrderSlice
  );

  useEffect(() => {
    return () => {
      dispatch(resetSaleOrder());
    };
  }, []);

  return (
    <Card
      className="size-full"
      title="Nueva venta"
    >
      <SaleOrderForm />
      {saleOrderInitialized && saleOrderData?._id && (
        <>
          <SaleOrderDetailForm saleOrderId={saleOrderData?._id} />
          <SaleOrderDetailList saleOrderId={saleOrderData?._id} />
        </>
      )}
    </Card>
  );
};

export default CreateSaleOrder;
