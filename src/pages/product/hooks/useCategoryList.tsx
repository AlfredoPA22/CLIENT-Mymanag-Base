import { useQuery } from "@apollo/client";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { useEffect, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { ICategory } from "../../../utils/interfaces/Category";
import { IReactSelect } from "../../../utils/interfaces/Select";

const useCategoryList = () => {
  const {
    data: { listCategory: listCategory } = [],
    loading: loadingListCategory,
    error,
  } = useQuery(LIST_CATEGORY, { fetchPolicy: "network-only" });

  const [listCategorySelect, setListCategorySelect] = useState<IReactSelect[]>(
    []
  );

  useEffect(() => {
    if (listCategory) {
      const listModified: IReactSelect[] = listCategory.map(
        (elem: ICategory) => ({
          value: elem._id,
          label: elem.name,
        })
      );
      setListCategorySelect(listModified);
    }
  }, [listCategory]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return { listCategory, listCategorySelect, loadingListCategory };
};

export default useCategoryList;
