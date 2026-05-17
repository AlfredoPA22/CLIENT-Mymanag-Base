import { useQuery } from "@apollo/client";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { FIND_PRODUCT } from "../../../../graphql/queries/Product";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { showToast } from "../../../../utils/toastUtils";
import ProductCard from "./ProductCard";
import ListSaleOrderByProduct from "./ListSaleOrderByProduct";
import ListPurchaseOrderByProduct from "./ListPurchaseOrderByProduct";

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
    <TabView className="size-full" scrollable>
      <TabPanel
        header={<span className="text-sm"><span className="hidden sm:inline">Información </span>General</span>}
      >
        <ProductCard productData={data.findProduct} />
      </TabPanel>
      <TabPanel header={<span className="text-sm">Ventas</span>}>
        <ListSaleOrderByProduct productId={productId} />
      </TabPanel>
      <TabPanel header={<span className="text-sm">Compras</span>}>
        <ListPurchaseOrderByProduct productId={productId} />
      </TabPanel>
    </TabView>
  );
};

export default ProductDetail;
