import { FC } from "react";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  purchaseOrderId: string;
  purchaseOrderDetailId: string;
  editMode?: boolean;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  purchaseOrderDetailId,
  purchaseOrderId,
  editMode = true,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {editMode && (
        <AddSerialToDetailForm
          purchaseOrderId={purchaseOrderId}
          purchaseOrderDetailId={purchaseOrderDetailId}
        />
      )}

      <SerialByDetailList
        purchaseOrderId={purchaseOrderId}
        purchaseOrderDetailId={purchaseOrderDetailId}
        editMode={editMode}
      />
    </div>
  );
};

export default SerialToDetail;
