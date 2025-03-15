import { useEffect } from "react";
import PurchaseOrderForm from "./PurchaseOrderForm";
import { useDispatch, useSelector } from "react-redux";
import { resetPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
import PurchaseOrderDetailForm from "./PurchaseOrderDetailForm";
import { RootState } from "../../../../redux/store";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";
import { Card } from "primereact/card";

const CreatePurchaseOrder = () => {
  const dispatch = useDispatch();

  const { purchaseOrderInitialized, purchaseOrderData } = useSelector(
    (state: RootState) => state.purchaseOrderSlice
  );

  useEffect(() => {
    return () => {
      dispatch(resetPurchaseOrder());
    };
  }, []);

  return (
    <Card
      className="size-full"
      title="Nueva compra"
    >
      <PurchaseOrderForm />
      {purchaseOrderInitialized && purchaseOrderData?._id && (
        <>
          <PurchaseOrderDetailForm purchaseOrderId={purchaseOrderData?._id} />
          <PurchaseOrderDetailList purchaseOrderId={purchaseOrderData?._id} />
        </>
      )}
    </Card>
  );
};

export default CreatePurchaseOrder;
