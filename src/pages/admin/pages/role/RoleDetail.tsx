import { Card } from "primereact/card";
import { FC, useMemo } from "react";
import { IRole } from "../../../../utils/interfaces/Role";
import usePermissionList from "../../hooks/usePermissionList";
import { Tree } from "primereact/tree";
import { TreeNode } from "primereact/treenode";

interface RoleDetailProps {
  role: IRole;
}

const RoleDetail: FC<RoleDetailProps> = ({ role }) => {
  const { listPermissionSelect } = usePermissionList();

  const filteredTree: TreeNode[] = useMemo(() => {
    if (!role.permission || !listPermissionSelect) return [];

    const tree = listPermissionSelect
      .map((category): TreeNode | null => {
        const matchedChildren = category.children?.filter((child) =>
          role.permission.includes(child.key)
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
      .filter((node): node is TreeNode => node !== null); // 👈 Type guard correcto

    return tree;
  }, [role.permission, listPermissionSelect]);

  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-white shadow-lg rounded-2xl p-6 border-none">
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 break-words">{role.name}</h2>
        </div>

        <div className="flex flex-col gap-2 text-gray-700 text-sm">
          <div className="flex items-start gap-2">
            <i className="pi pi-align-left text-blue-500 shrink-0 mt-0.5" />
            <span className="font-medium shrink-0">Descripción:</span>
            <span className="break-words">{role.description}</span>
          </div>

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

export default RoleDetail;
