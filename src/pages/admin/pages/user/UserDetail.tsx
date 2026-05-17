import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";
import { FC, useMemo } from "react";
import { IUser } from "../../../../utils/interfaces/User";
import usePermissionList from "../../hooks/usePermissionList";

interface UserDetailProps {
  user: IUser;
}

const UserDetail: FC<UserDetailProps> = ({ user }) => {
  const { listPermissionSelect } = usePermissionList();

  const filteredTree: TreeNode[] = useMemo(() => {
    if (!user.role.permission || !listPermissionSelect) return [];

    return listPermissionSelect
      .map((category): TreeNode | null => {
        const matchedChildren = category.children?.filter((child) =>
          user.role.permission.includes(child.key)
        );

        if (matchedChildren && matchedChildren.length > 0) {
          return {
            key: category.key,
            label: category.label,
            children: matchedChildren.map((child) => ({
              key: child.key,
              label: child.label,
            })),
          };
        }

        return null;
      })
      .filter((node): node is TreeNode => node !== null);
  }, [user.role.permission, listPermissionSelect]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-white shadow-lg rounded-2xl p-6 border-none">
        <div className="flex items-start justify-between gap-2 mb-4">
          <h2 className="text-xl font-bold text-gray-800 break-words min-w-0">{user.user_name}</h2>
          <Badge
            value={user.is_active ? "Activo" : "Inactivo"}
            severity={user.is_active ? "success" : "danger"}
            className="shrink-0"
          />
        </div>

        <div className="flex flex-col gap-2 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <i className="pi pi-id-card text-blue-500 shrink-0" />
            <span className="font-medium shrink-0">Rol:</span>
            <span className="break-words">{user.role.name}</span>
          </div>

          <div className="flex items-start gap-2">
            <i className="pi pi-align-left text-blue-500 shrink-0 mt-0.5" />
            <span className="font-medium shrink-0">Descripción:</span>
            <span className="break-words">{user.role.description}</span>
          </div>

          {/* 🌳 Permisos del usuario */}
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <i className="pi pi-lock text-green-500"></i>
              <span className="font-medium text-gray-800">Permisos:</span>
            </div>
            <Tree value={filteredTree} className="w-full md:w-30rem" />
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDetail;
