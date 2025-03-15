import { FC } from "react";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  saleOrderId: string;
  saleOrderDetailId: string;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  saleOrderDetailId,
  saleOrderId,
}) => {
  return (
    <div>
      <AddSerialToDetailForm
        saleOrderId={saleOrderId}
        saleOrderDetailId={saleOrderDetailId}
      />

      <SerialByDetailList
        saleOrderId={saleOrderId}
        saleOrderDetailId={saleOrderDetailId}
      />
    </div>
  );
};

export default SerialToDetail;
