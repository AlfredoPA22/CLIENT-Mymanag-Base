import { FC, useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../pages/auth/hooks/useAuth";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute: FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const { checkAuthentication, isAuthenticated } = useAuth();

  const location = useLocation();

  useEffect(() => {
    checkAuthentication();
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} />;
  }

  return children ? children : <Outlet />;
};
