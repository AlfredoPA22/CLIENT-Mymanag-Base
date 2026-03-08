import { useState } from "react";
import { useParams } from "react-router-dom";
import ProductTransferDetail from "./ProductTransferDetail";
import ProductTransferDetailForm from "./ProductTransferDetailForm";
import ProductTransferDetailList from "./ProductTransferDetailList";

const EditProductTransfer = () => {
  const { id } = useParams();
  const transferId = id ?? "";
  const [canApprove, setCanApprove] = useState(true);

  return (
    <div className="size-full">
      <ProductTransferDetail
        transferId={transferId}
        approveBlocked={!canApprove}
      />
      <ProductTransferDetailForm transferId={transferId} />
      <ProductTransferDetailList
        transferId={transferId}
        editMode
        onCanApproveChange={setCanApprove}
      />
    </div>
  );
};

export default EditProductTransfer;
