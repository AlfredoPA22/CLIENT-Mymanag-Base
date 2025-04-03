import { useQuery } from "@apollo/client";
import { TabPanel, TabView } from "primereact/tabview";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { FIND_PRODUCT } from "../../../graphql/queries/Product";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { showToast } from "../../../utils/toastUtils";
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
      <TabPanel header="Proveedores y compras">
        <p className="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident,
          similique sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus.
        </p>
      </TabPanel>
      <TabPanel header="clientes y ventas">
        <p className="m-0">
          At vero eos et accusamus et iusto odio dignissimos ducimus qui
          blanditiis praesentium voluptatum deleniti atque corrupti quos dolores
          et quas molestias excepturi sint occaecati cupiditate non provident,
          similique sunt in culpa qui officia deserunt mollitia animi, id est
          laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita
          distinctio. Nam libero tempore, cum soluta nobis est eligendi optio
          cumque nihil impedit quo minus.
        </p>
      </TabPanel>
    </TabView>
  );
};

export default ProductDetail;
