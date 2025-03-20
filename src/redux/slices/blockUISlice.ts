import { PayloadAction, createSlice } from "@reduxjs/toolkit";

interface BlockUISliceState {
  isBlocked: boolean;
}

const initialState: BlockUISliceState = {
  isBlocked: false,
};

const blockUISlice = createSlice({
  name: "blockUISlice",
  initialState,
  reducers: {
    setIsBlocked: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isBlocked: action.payload,
    }),
  },
});

export const { setIsBlocked } = blockUISlice.actions;
export default blockUISlice;
