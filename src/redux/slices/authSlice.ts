import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AuthSliceState {
  isAuthenticated: boolean;
  token: string;
  userId: string;
  userName: string;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  token: "",
  userId: "",
  userName: "",
};

const authSlice = createSlice({
  name: "authSlice",
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<AuthSliceState>) => ({
      ...state,
      token: action.payload.token,
      userId: action.payload.userId,
      userName: action.payload.userName,
      isAuthenticated: action.payload.isAuthenticated,
    }),
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isAuthenticated: action.payload,
    }),
    resetAuth: () => initialState,
  },
});

export const { setLogin, setIsAuthenticated, resetAuth } = authSlice.actions;

export default authSlice;
