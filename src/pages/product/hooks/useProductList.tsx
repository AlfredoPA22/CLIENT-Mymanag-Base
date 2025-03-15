import {
  // useApolloClient,
  useQuery,
} from "@apollo/client";
import { useEffect, useState } from "react";
import {
  LIST_PRODUCT,
} from "../../../graphql/queries/Product";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProduct } from "../../../utils/interfaces/Product";

const useProductList = () => {

  const {
    data: { listProduct: listProductQuery } = [],
    loading: loadingListProduct,
    error,
    refetch,
  } = useQuery(LIST_PRODUCT,{fetchPolicy: "network-only",});

  const [listProduct, setListProduct] = useState<IProduct[]>([]);

  const handleResetFilter = async () => {
    const { data } = await refetch();
    setListProduct(data.listProduct);
  };

  useEffect(() => {
    if (error) {
      showToast({
        detail: error.message,
        severity: ToastSeverity.Success,
      });
    } else if (listProductQuery) {
      const modifiedProductList = listProductQuery.map((product: IProduct) => ({
        ...product,
        fullName: `(${product.code}) ${product.name} - ${product.brand.name} - ${product.category.name}`,
      }));
      setListProduct(modifiedProductList);
    }
  }, [error, listProductQuery]);

  return {
    listProduct,
    loadingListProduct,
    // handleFilterProductByCategory,
    handleResetFilter,
  };
};

export default useProductList;
