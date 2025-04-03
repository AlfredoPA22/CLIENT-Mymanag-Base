import { useQuery } from "@apollo/client";
import { LIST_CLIENT } from "../../../graphql/queries/Client";
import { useEffect, useState } from "react";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IReactSelect } from "../../../utils/interfaces/Select";
import { IClient } from "../../../utils/interfaces/Client";

const useClientList = () => {
  const {
    data: { listClient: listClient } = [],
    loading: loadingListClient,
    error,
  } = useQuery(LIST_CLIENT, { fetchPolicy: "network-only" });

  const [listClientSelect, setListClientSelect] = useState<IReactSelect[]>([]);

  useEffect(() => {
    if (listClient) {
      const listModified: IReactSelect[] = listClient.map((elem: IClient) => ({
        value: elem._id,
        label: elem.fullName,
      }));
      setListClientSelect(listModified);
    }
  }, [listClient]);

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);
  return { listClientSelect, listClient, loadingListClient };
};

export default useClientList;
