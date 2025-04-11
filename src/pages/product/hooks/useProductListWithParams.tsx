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
  warehouseId: string;
}

const useProductListWithParams = ({
  brandId,
  categoryId,
  warehouseId,
}: ProductListWithParamsProps) => {
  const {
    data: { listProductWithParams: listProductWithParams } = [],
    loading: loadingListProductWithParams,
    error,
  } = useQuery(LIST_PRODUCT_WITH_PARAMS, {
    variables: {
      brandId,
      categoryId,
      warehouseId,
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
