import { useParams } from "react-router-dom";
import ProductTransferDetail from "./ProductTransferDetail";
import ProductTransferDetailList from "./ProductTransferDetailList";

const ViewProductTransfer = () => {
  const { id } = useParams();
  const transferId = id ?? "";

  return (
    <div className="size-full">
      <ProductTransferDetail transferId={transferId} />
      <ProductTransferDetailList transferId={transferId} editMode={false} />
    </div>
  );
};

export default ViewProductTransfer;
