import { FC } from "react";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  saleOrderId: string;
  saleOrderDetailId: string;
  editMode?: boolean;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  saleOrderDetailId,
  saleOrderId,
  editMode = true,
}) => {
  return (
    <div>
      {editMode && (
        <AddSerialToDetailForm
          saleOrderId={saleOrderId}
          saleOrderDetailId={saleOrderDetailId}
        />
      )}

      <SerialByDetailList
        saleOrderId={saleOrderId}
        saleOrderDetailId={saleOrderDetailId}
        editMode={editMode}
      />
    </div>
  );
};

export default SerialToDetail;
