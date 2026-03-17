import { Navigate } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAbility } from '../../../casl/AbilityContext';
import { canDoAny } from '../../../casl/ability';

type Props = {
  children: ReactNode;
  permissions: string[];
};

export const PermissionRoute = ({ children, permissions }: Props) => {
  const ability = useAbility();
  const hasPermission = canDoAny(ability, permissions);
  if (!hasPermission) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};
