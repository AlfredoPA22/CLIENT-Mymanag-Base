import { FC } from "react";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  purchaseOrderId: string;
  purchaseOrderDetailId: string;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  purchaseOrderDetailId,
  purchaseOrderId,
}) => {
  return (
    <div>
      <AddSerialToDetailForm
        purchaseOrderId={purchaseOrderId}
        purchaseOrderDetailId={purchaseOrderDetailId}
      />

      <SerialByDetailList
        purchaseOrderId={purchaseOrderId}
        purchaseOrderDetailId={purchaseOrderDetailId}
      />
    </div>
  );
};

export default SerialToDetail;
