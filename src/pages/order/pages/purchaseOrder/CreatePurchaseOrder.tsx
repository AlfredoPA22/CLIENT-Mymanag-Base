import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPurchaseOrder } from "../../../../redux/slices/purchaseOrderSlice";
import { RootState } from "../../../../redux/store";
import PurchaseOrderDetailForm from "./PurchaseOrderDetailForm";
import PurchaseOrderDetailList from "./PurchaseOrderDetailList";
import PurchaseOrderForm from "./PurchaseOrderForm";

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
    <div className="size-full">
      <PurchaseOrderForm />
      {purchaseOrderInitialized && purchaseOrderData?._id && (
        <>
          <PurchaseOrderDetailForm purchaseOrderId={purchaseOrderData?._id} />
          <PurchaseOrderDetailList purchaseOrderId={purchaseOrderData?._id} />
        </>
      )}
    </div>
  );
};

export default CreatePurchaseOrder;
