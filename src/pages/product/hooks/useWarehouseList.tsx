import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { LIST_BRAND } from "../../../graphql/queries/Brand";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { IBrand } from "../../../utils/interfaces/Brand";
import { LIST_WAREHOUSE } from "../../../graphql/queries/Warehouse";
import { IWarehouse } from "../../../utils/interfaces/Warehouse";

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
