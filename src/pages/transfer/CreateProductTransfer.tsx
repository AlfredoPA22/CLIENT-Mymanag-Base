import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetProductTransfer } from "../../redux/slices/productTransferSlice";
import { RootState } from "../../redux/store";
import ProductTransferDetailForm from "./ProductTransferDetailForm";
import ProductTransferDetailList from "./ProductTransferDetailList";
import ProductTransferForm from "./ProductTransferForm";

const CreateProductTransfer = () => {
  const dispatch = useDispatch();
  const [canApprove, setCanApprove] = useState(true);

  const { productTransferInitialized, productTransferData } = useSelector(
    (state: RootState) => state.productTransferSlice
  );

  useEffect(() => {
    return () => {
      dispatch(resetProductTransfer());
    };
  }, []);

  return (
    <div className="size-full">
      <ProductTransferForm approveBlocked={!canApprove} />
      {productTransferInitialized && productTransferData?._id && (
        <>
          <ProductTransferDetailForm transferId={productTransferData._id} />
          <ProductTransferDetailList
            transferId={productTransferData._id}
            editMode
            onCanApproveChange={setCanApprove}
          />
        </>
      )}
    </div>
  );
};

export default CreateProductTransfer;
