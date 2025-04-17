import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import useAuth from "../hooks/useAuth";

type Props = {
  children: ReactNode;
  permissions: string[];
};

export const PermissionRoute = ({ children, permissions }: Props) => {
  const { permissions: userPermissions } = useAuth();

  const hasPermission = permissions.some((p) => userPermissions.includes(p));

  if (!hasPermission) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};