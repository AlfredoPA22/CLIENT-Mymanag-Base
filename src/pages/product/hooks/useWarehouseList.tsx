import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { LIST_WAREHOUSE } from "../../../graphql/queries/Warehouse";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { IWarehouse } from "../../../utils/interfaces/Warehouse";
import { showToast } from "../../../utils/toastUtils";

const useWarehouseList = () => {
  const {
    data: { listWarehouse: listWarehouse } = [],
    loading: loadingListWarehouse,
    error,
  } = useQuery(LIST_WAREHOUSE, { fetchPolicy: "network-only" });

  const [listWarehouseSelect, setListWarehouseSelect] = useState<
    IReactSelect[]
  >([]);

  useEffect(() => {
    if (listWarehouse) {
      const listModified: IReactSelect[] = listWarehouse.map(
        (elem: IWarehouse) => ({
          value: elem._id,
          label: elem.name,
        })
      );
      setListWarehouseSelect(listModified);
    }
  }, [listWarehouse]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listWarehouseSelect, listWarehouse, loadingListWarehouse };
};

export default useWarehouseList;
