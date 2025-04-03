import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { LIST_BRAND } from "../../../graphql/queries/Brand";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { IBrand } from "../../../utils/interfaces/Brand";

const useBrandList = () => {
  const {
    data: { listBrand: listBrand } = [],
    loading: loadingListBrand,
    error,
  } = useQuery(LIST_BRAND, { fetchPolicy: "network-only" });

  const [listBrandSelect, setListBrandSelect] = useState<IReactSelect[]>([]);

  useEffect(() => {
    if (listBrand) {
      const listModified: IReactSelect[] = listBrand.map((elem: IBrand) => ({
        value: elem._id,
        label: elem.name,
      }));
      setListBrandSelect(listModified);
    }
  }, [listBrand]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listBrandSelect, listBrand, loadingListBrand };
};

export default useBrandList;
