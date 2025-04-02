import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { LIST_PERMISSION } from "../../../graphql/queries/Permission";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import {
  IPermission,
  TreeNodeInterface,
} from "../../../utils/interfaces/Permission";
import { showToast } from "../../../utils/toastUtils";

const usePermissionList = () => {
  const {
    data: { listPermission: listPermission } = [],
    loading: loadingListPermission,
    error,
  } = useQuery(LIST_PERMISSION, { fetchPolicy: "network-only" });

  const [listPermissionSelect, setListPermissionSelect] = useState<
    TreeNodeInterface[]
  >([]);

  useEffect(() => {
    if (listPermission) {
      const transformData = (
        permissions: IPermission[]
      ): TreeNodeInterface[] => {
        return permissions.map((permission: IPermission) => ({
          key: permission.value,
          label: `${permission.label}`,
          data: permission.value,
          children: transformData(permission.children || []),
        }));
      };

      const transformedAccounts = transformData(listPermission);
      setListPermissionSelect(transformedAccounts);
    }
  }, [listPermission]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listPermission, listPermissionSelect, loadingListPermission };
};

export default usePermissionList;
