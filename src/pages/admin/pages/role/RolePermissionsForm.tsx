import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import {
  TreeSelectChangeEvent,
  TreeSelectSelectionKeysType,
} from "primereact/treeselect";
import { FC, useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import TreeSelectInput from "../../../../components/TreeSelectInput/TreeSelectInput";
import { UPDATE_ROLE_PERMISSIONS } from "../../../../graphql/mutations/Role";
import {
  LIST_PERMISSIONS_BY_ROLE,
  LIST_ROLE,
} from "../../../../graphql/queries/Role";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { TreeNodeInterface } from "../../../../utils/interfaces/Permission";
import { IRole } from "../../../../utils/interfaces/Role";
import { showToast } from "../../../../utils/toastUtils";
import usePermissionList from "../../hooks/usePermissionList";

interface RolePermissionsFormProps {
  role: IRole;
  onClose: () => void;
}

/**
 * Converts a flat permission-key array into the TreeSelect selection object format.
 * Parent nodes get checked=true when all children are selected, partialChecked=true otherwise.
 */
const buildTreeSelection = (
  permissions: string[],
  tree: TreeNodeInterface[]
): TreeSelectSelectionKeysType => {
  const result: TreeSelectSelectionKeysType = {};
  const permSet = new Set(permissions);

  tree.forEach((node) => {
    const children = node.children ?? [];

    if (children.length === 0) {
      // Leaf node (e.g. USER_AND_ROLE)
      if (permSet.has(node.key)) {
        result[node.key] = { checked: true, partialChecked: false };
      }
    } else {
      const checkedCount = children.filter((c) => permSet.has(c.key)).length;
      if (checkedCount === children.length) {
        result[node.key] = { checked: true, partialChecked: false };
        children.forEach((c) => {
          result[c.key] = { checked: true, partialChecked: false };
        });
      } else if (checkedCount > 0) {
        result[node.key] = { checked: false, partialChecked: true };
        children.forEach((c) => {
          if (permSet.has(c.key)) {
            result[c.key] = { checked: true, partialChecked: false };
          }
        });
      }
    }
  });

  return result;
};

const RolePermissionsForm: FC<RolePermissionsFormProps> = ({ role, onClose }) => {
  const dispatch = useDispatch();
  const { listPermissionSelect, loadingListPermission } = usePermissionList();

  const { data: permData, loading: loadingPerms } = useQuery(
    LIST_PERMISSIONS_BY_ROLE,
    {
      variables: { roleId: role._id },
      fetchPolicy: "network-only",
    }
  );

  const [updateRolePermissions] = useMutation(UPDATE_ROLE_PERMISSIONS, {
    refetchQueries: [{ query: LIST_ROLE }],
  });

  // Selection state for the TreeSelect widget
  const [selection, setSelection] = useState<TreeSelectSelectionKeysType | null>(null);
  // Flat array of leaf permission keys derived from selection
  const [activePermissions, setActivePermissions] = useState<string[]>([]);

  // Pre-populate once both tree and current permissions are loaded
  useEffect(() => {
    if (!loadingListPermission && !loadingPerms && listPermissionSelect && permData) {
      const currentPerms: string[] = permData.listPermissionsByRole ?? [];
      const initialSelection = buildTreeSelection(currentPerms, listPermissionSelect);
      setSelection(initialSelection);
      setActivePermissions(currentPerms);
    }
  }, [loadingListPermission, loadingPerms, listPermissionSelect, permData]);

  const handleChangePermissions = (e: TreeSelectChangeEvent) => {
    const value = e.target.value as TreeSelectSelectionKeysType;
    setSelection(value ?? null);
    const leafKeys = Object.keys(value ?? {}).filter(
      (key) => !key.startsWith("ALL_")
    );
    setActivePermissions(leafKeys);
  };

  // Detect changes: compare sorted arrays
  const originalPerms: string[] = useMemo(
    () => (permData?.listPermissionsByRole ?? []).slice().sort(),
    [permData]
  );

  const isDirty = useMemo(() => {
    const current = [...activePermissions].sort();
    if (current.length !== originalPerms.length) return true;
    return current.some((p, i) => p !== originalPerms[i]);
  }, [activePermissions, originalPerms]);

  const handleSave = async () => {
    try {
      dispatch(setIsBlocked(true));
      await updateRolePermissions({
        variables: {
          roleId: role._id,
          permissions: activePermissions,
        },
      });
      showToast({
        detail: "Permisos actualizados correctamente",
        severity: ToastSeverity.Success,
      });
      onClose();
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  if (loadingListPermission || loadingPerms) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-6">
      {/* Role info header */}
      <div className="flex flex-col gap-1 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{role.name}</h3>
        {role.description && (
          <p className="text-sm text-gray-500">{role.description}</p>
        )}
        <p className="text-xs text-gray-400 mt-1">
          Permisos activos actualmente:{" "}
          <span className="font-medium text-gray-600">
            {originalPerms.length}
          </span>
        </p>
      </div>

      {/* Permission tree */}
      <div className="flex flex-col gap-2">
        <TreeSelectInput
          label="Permisos del rol"
          name="permission"
          placeholder="Seleccione los permisos"
          filter
          selectionMode="checkbox"
          options={listPermissionSelect}
          value={selection}
          onChange={handleChangePermissions}
          className="w-full"
        />
        <p className="text-xs text-gray-400">
          Permisos seleccionados:{" "}
          <span className="font-semibold text-gray-600">
            {activePermissions.length}
          </span>
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
        <Button
          type="button"
          label="Cancelar"
          severity="secondary"
          outlined
          onClick={onClose}
        />
        <Button
          type="button"
          label="Guardar permisos"
          icon="pi pi-check"
          severity="success"
          disabled={!isDirty}
          onClick={handleSave}
        />
      </div>
    </div>
  );
};

export default RolePermissionsForm;
