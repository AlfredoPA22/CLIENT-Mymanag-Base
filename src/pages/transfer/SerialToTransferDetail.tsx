import { FC } from "react";
import AddSerialToTransferDetailForm from "./AddSerialToTransferDetailForm";
import SerialByTransferDetailList from "./SerialByTransferDetailList";

interface SerialToTransferDetailProps {
  transferId: string;
  transferDetailId: string;
  serials: string[];
  quantity: number;
  editMode?: boolean;
}

const SerialToTransferDetail: FC<SerialToTransferDetailProps> = ({
  transferId,
  transferDetailId,
  serials,
  quantity,
  editMode = true,
}) => {
  return (
    <div className="flex flex-col gap-4 p-2">
      {editMode && (
        <AddSerialToTransferDetailForm
          transferId={transferId}
          transferDetailId={transferDetailId}
        />
      )}
      <SerialByTransferDetailList
        transferId={transferId}
        transferDetailId={transferDetailId}
        serials={serials}
        quantity={quantity}
        editMode={editMode}
      />
    </div>
  );
};

export default SerialToTransferDetail;
