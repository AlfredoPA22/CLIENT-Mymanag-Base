import { useQuery } from "@apollo/client";
import { useEffect, useMemo } from "react";
import { LIST_PRODUCT } from "../../../graphql/queries/Product";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProduct } from "../../../utils/interfaces/Product";

const useProductList = () => {
  const {
    data,
    loading: loadingListProduct,
    error,
    refetch,
  } = useQuery(LIST_PRODUCT, { fetchPolicy: "cache-and-network" });

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Success });
    }
  }, [error]);

  const listProduct = useMemo<IProduct[]>(() => {
    if (!data?.listProduct) return [];
    return data.listProduct.map((product: IProduct) => ({
      ...product,
      fullName: `(${product.code}) ${product.name} - ${product.brand.name} - ${product.category.name}`,
    }));
  }, [data?.listProduct]);

  const handleResetFilter = () => refetch();

  return { listProduct, loadingListProduct, handleResetFilter };
};

export default useProductList;
