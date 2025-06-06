import { useQuery } from "@apollo/client";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { FIND_PRODUCT } from "../../../../graphql/queries/Product";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import ProductCard from "./ProductCard";

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
    <TabView className="size-full">
      <TabPanel header="Informacion general">
        <ProductCard productData={data.findProduct} />
      </TabPanel>
    </TabView>
  );
};

export default ProductDetail;
