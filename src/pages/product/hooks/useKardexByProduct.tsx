import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { LIST_KARDEX_BY_PRODUCT } from "../../../graphql/queries/Kardex";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IKardexEntry } from "../../../utils/interfaces/Kardex";
import { showToast } from "../../../utils/toastUtils";

const useKardexByProduct = (productId: string) => {
  const {
    data: { listKardexByProduct: listKardex } = {},
    loading: loadingKardex,
    error,
  } = useQuery(LIST_KARDEX_BY_PRODUCT, {
    fetchPolicy: "network-only",
    variables: { productId },
  });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  return {
    listKardex: (listKardex ?? []) as IKardexEntry[],
    loadingKardex,
  };
};

export default useKardexByProduct;
