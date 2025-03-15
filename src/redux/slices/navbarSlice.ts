import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface NavBarSilceState {
  currentModule: number;
}

const initialState: NavBarSilceState = {
  currentModule: 0,
};

const navbarSlice = createSlice({
  name: "navbarSlice",
  initialState,
  reducers: {
    setCurrentModule: (state, action: PayloadAction<number>) => ({
      ...state,
      currentModule: action.payload,
    }),
    resetNavbar: () => initialState,
  },
});

export const { setCurrentModule, resetNavbar } = navbarSlice.actions;
export default navbarSlice;
