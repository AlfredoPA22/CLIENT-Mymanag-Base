import { TabPanel, TabView } from "primereact/tabview";
import ProductList from "./ProductList";
import BrandList from "./BrandList";
import CategoryList from "./CategoryList";

const ProductPage = () => {
  return (
    <TabView className="size-full">
      <TabPanel header="Productos">
        <ProductList />
      </TabPanel>
      <TabPanel header="Marcas">
        <BrandList />
      </TabPanel>
      <TabPanel header="Categorias">
        <CategoryList />
      </TabPanel>
    </TabView>
  );
};

export default ProductPage;
