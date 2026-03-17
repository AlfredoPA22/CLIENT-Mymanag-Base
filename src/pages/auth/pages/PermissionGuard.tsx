import { FC } from 'react';
import { useAbility } from '../../../casl/AbilityContext';
import { canDoAny } from '../../../casl/ability';

export const PermissionGuard: FC<{
  permissions: string[];
  children: React.ReactNode;
}> = ({ permissions: requiredPermissions, children }) => {
  const ability = useAbility();
  if (requiredPermissions.length === 0) return <>{children}</>;
  if (!canDoAny(ability, requiredPermissions)) return null;
  return <>{children}</>;
};
