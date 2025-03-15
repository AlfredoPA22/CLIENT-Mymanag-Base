import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { ISaleOrder } from "../../utils/interfaces/SaleOrder";

export interface SaleOrderSliceState {
  saleOrderInitialized: boolean;
  saleOrderData: ISaleOrder | undefined;
}

const initialState: SaleOrderSliceState = {
  saleOrderInitialized: false,
  saleOrderData: undefined,
};

const saleOrderSlice = createSlice({
  name: "saleOrderSlice",
  initialState,
  reducers: {
    setSaleOrderInitialized: (state, action: PayloadAction<boolean>) => {
      state.saleOrderInitialized = action.payload;
    },
    setSaleOrder: (state, action: PayloadAction<ISaleOrder>) => {
      state.saleOrderData = action.payload;
    },
    resetSaleOrder: () => initialState,
  },
});

export const { setSaleOrderInitialized, setSaleOrder, resetSaleOrder } =
  saleOrderSlice.actions;

export default saleOrderSlice;
