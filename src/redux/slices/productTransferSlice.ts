import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IProductTransfer } from "../../utils/interfaces/ProductTransfer";

export interface ProductTransferSliceState {
  productTransferInitialized: boolean;
  productTransferData: IProductTransfer | undefined;
}

const initialState: ProductTransferSliceState = {
  productTransferInitialized: false,
  productTransferData: undefined,
};

const productTransferSlice = createSlice({
  name: "productTransferSlice",
  initialState,
  reducers: {
    setProductTransferInitialized: (state, action: PayloadAction<boolean>) => {
      state.productTransferInitialized = action.payload;
    },
    setProductTransfer: (state, action: PayloadAction<IProductTransfer>) => {
      state.productTransferData = action.payload;
    },
    resetProductTransfer: () => initialState,
  },
});

export const {
  setProductTransferInitialized,
  setProductTransfer,
  resetProductTransfer,
} = productTransferSlice.actions;

export default productTransferSlice;
