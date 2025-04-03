import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { LIST_PROVIDER } from "../../../graphql/queries/Provider";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProvider } from "../../../utils/interfaces/Provider";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { showToast } from "../../../utils/toastUtils";

const useProviderList = () => {
  const {
    data: { listProvider: listProvider } = [],
    loading: loadingListProvider,
    error,
  } = useQuery(LIST_PROVIDER, { fetchPolicy: "network-only" });

  const [listProviderSelect, setListProviderSelect] = useState<IReactSelect[]>(
    []
  );

  useEffect(() => {
    if (listProvider) {
      const listModified: IReactSelect[] = listProvider.map(
        (elem: IProvider) => ({
          value: elem._id,
          label: elem.name,
        })
      );
      setListProviderSelect(listModified);
    }
  }, [listProvider]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listProviderSelect, listProvider, loadingListProvider };
};

export default useProviderList;
