import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface AuthSliceState {
  isAuthenticated: boolean;
  token: string;
  userId: string;
  userName: string;
  companyName: string;
  companyLogo?: string;
  currency: string;
  permissions: string[];
  isGlobal: boolean;
}

const initialState: AuthSliceState = {
  isAuthenticated: false,
  token: "",
  userId: "",
  userName: "",
  companyName: "",
  companyLogo: "",
  currency: "",
  permissions: [],
  isGlobal: false,
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
      currency: action.payload.currency,
      companyName: action.payload.companyName,
      companyLogo: action.payload.companyLogo,
      permissions: action.payload.permissions,
      isAuthenticated: action.payload.isAuthenticated,
      isGlobal: action.payload.isGlobal,
    }),
    setIsAuthenticated: (state, action: PayloadAction<boolean>) => ({
      ...state,
      isAuthenticated: action.payload,
    }),
    setCompanyInfo: (
      state,
      action: PayloadAction<{ companyName?: string; currency?: string; companyLogo?: string }>
    ) => ({
      ...state,
      ...(action.payload.companyName !== undefined && {
        companyName: action.payload.companyName,
      }),
      ...(action.payload.currency !== undefined && {
        currency: action.payload.currency,
      }),
      ...(action.payload.companyLogo !== undefined && {
        companyLogo: action.payload.companyLogo,
      }),
    }),
    resetAuth: () => initialState,
  },
});

export const { setLogin, setIsAuthenticated, setCompanyInfo, resetAuth } =
  authSlice.actions;

export default authSlice;
