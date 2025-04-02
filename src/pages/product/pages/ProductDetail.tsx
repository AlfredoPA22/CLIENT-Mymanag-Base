import { useQuery } from "@apollo/client";
import { Card } from "primereact/card";
import { FC, useEffect } from "react";
import { FIND_PRODUCT } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";
import ProductCard from "./ProductCard";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const ProductDetail = () => {
  const { id } = useParams();
  const productId: string = id || "";

  const {
    data,
    loading: loadingProduct,
    error: errorProduct,
  } = useQuery(FIND_PRODUCT, {
    variables: { productId },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (errorProduct) {
      showToast({
        detail: errorProduct.message,
        severity: ToastSeverity.Error,
      });
    }
  }, [errorProduct]);

  if (loadingProduct) {
    return <LoadingSpinner />;
  }

  return (
    <Card title={`Detalle del producto`} className="flex flex-col w-screen gap-2">
      <ProductCard productData={data.findProduct} />
    </Card>
  );
};

export default ProductDetail;
