import { FC } from "react";
import useAuth from "../hooks/useAuth";

export const PermissionGuard: FC<{
  permissions: string[];
  children: React.ReactNode;
}> = ({ permissions: requiredPermissions, children }) => {
  const { permissions } = useAuth();

  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((permission) =>
      permissions.includes(permission)
    );
  };

  if (!hasPermission(requiredPermissions)) return null;
  return <>{children}</>;
};
