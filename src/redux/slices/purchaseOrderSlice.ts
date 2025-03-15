import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { IPurchaseOrder } from "../../utils/interfaces/PurchaseOrder";

export interface PurchaseOrderSliceState {
  purchaseOrderInitialized: boolean;
  purchaseOrderData: IPurchaseOrder | undefined;
}

const initialState: PurchaseOrderSliceState = {
  purchaseOrderInitialized: false,
  purchaseOrderData: undefined,
};

const purchaseOrderSlice = createSlice({
  name: "purchaseOrderSlice",
  initialState,
  reducers: {
    setPurchaseOrderInitialized: (state, action: PayloadAction<boolean>) => {
      state.purchaseOrderInitialized = action.payload;
    },
    setPurchaseOrder: (state, action: PayloadAction<IPurchaseOrder>) => {
      state.purchaseOrderData = action.payload;
    },
    resetPurchaseOrder: () => initialState,
  },
});

export const {
  setPurchaseOrderInitialized,
  resetPurchaseOrder,
  setPurchaseOrder,
} = purchaseOrderSlice.actions;

export default purchaseOrderSlice;
