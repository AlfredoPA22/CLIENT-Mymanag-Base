import { useMutation } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

import { LOGIN } from "../../../graphql/mutations/User";

import store, { RootState } from "../../../redux/store";
import { DecodedToken, ILoginInput } from "../../../utils/interfaces/User";
import {
  resetAuth,
  setIsAuthenticated,
  setLogin,
} from "../../../redux/slices/authSlice";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { resetNavbar } from "../../../redux/slices/navbarSlice";
import { resetPurchaseOrder } from "../../../redux/slices/purchaseOrderSlice";
import { resetSaleOrder } from "../../../redux/slices/saleOrderSlice";
import { resetProductTransfer } from "../../../redux/slices/productTransferSlice";

const useAuth = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    token,
    userName,
    userId,
    isAuthenticated,
    permissions,
    companyName,
    currency,
  } = useSelector((state: RootState) => state.authSlice);
  const [loadingLogin, setLoadingLogin] = useState<boolean>(false);
  const [loginMutation] = useMutation(LOGIN);

  const login = async (credentials: ILoginInput) => {
    try {
      setLoadingLogin(true);
      const { data } = await loginMutation({ variables: credentials });
      const token = data?.login;

      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        dispatch(
          setLogin({
            token,
            isAuthenticated: decoded.access,
            userId: decoded.id as string,
            userName: decoded.username ? decoded.username : "",
            permissions: decoded.permissions,
            currency: decoded.currency,
            companyName: decoded.company,
          })
        );
        navigate("/");
      } else {
        showToast({
          detail: "Usuario no valido",
          severity: ToastSeverity.Error,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      setLoadingLogin(false);
    }
  };

  const logout = async () => {
    dispatch(resetAuth());
    dispatch(resetNavbar());
    dispatch(resetPurchaseOrder());
    dispatch(resetSaleOrder());
    dispatch(resetProductTransfer());
    localStorage.clear();
    navigate("/login");
  };

  const isTokenExpired = () => {
    const token = store.getState().authSlice.token;
    if (token) {
      const decoded: DecodedToken = jwtDecode(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      return decoded?.exp && decoded.exp <= currentTimestamp;
    }
    return false;
  };

  const checkAuthentication = async () => {
    try {
      if (!token) {
        dispatch(setIsAuthenticated(false));
      } else {
        const isExpired = isTokenExpired();
        dispatch(setIsAuthenticated(isExpired ? false : true));
        if (isExpired && isAuthenticated) {
          showToast({
            detail: "Token expirado",
            severity: ToastSeverity.Error,
          });
          await logout();
        }
      }
    } catch (error: any) {
      dispatch(setIsAuthenticated(false));
      showToast({
        detail: error.message,
        severity: ToastSeverity.Error,
      });
    }
  };

  // const checkAuthorization = () => {
  //   const currentRoute = window.location.pathname;

  //   const matchingConfigs = roleBasedAccess.filter((config) =>
  //     config.routes.some((route) => matchRoute(currentRoute, route))
  //   );

  //   const allowedRoles = matchingConfigs.map((config) => config.role);

  //   return allowedRoles.some((role) => roles.includes(role));
  // };

  return {
    userId,
    userName,
    companyName,
    currency,
    permissions,
    loadingLogin,
    isAuthenticated,
    login,
    logout,
    checkAuthentication,
  };
};

export default useAuth;
