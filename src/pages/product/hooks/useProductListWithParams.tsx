import {
  // useApolloClient,
  useQuery,
} from "@apollo/client";
import { useEffect } from "react";
import { LIST_PRODUCT_WITH_PARAMS } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";

interface ProductListWithParamsProps {
  categoryId: string;
  brandId: string;
}

const useProductListWithParams = ({
  brandId,
  categoryId,
}: ProductListWithParamsProps) => {
  const {
    data: { listProductWithParams: listProductWithParams } = [],
    loading: loadingListProductWithParams,
    error,
  } = useQuery(LIST_PRODUCT_WITH_PARAMS, {
    variables: {
      brandId,
      categoryId,
    },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    }
  }, [error]);

  return {
    listProductWithParams,
    loadingListProductWithParams,
  };
};

export default useProductListWithParams;
