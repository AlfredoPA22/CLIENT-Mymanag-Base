import { TabPanel, TabView } from "primereact/tabview";
import ProductList from "./ProductList";
import CustomSaleItemsList from "./CustomSaleItemsList";

const ProductsPage = () => {
  return (
    // -mt recorta (sin cancelar del todo) el padding-top de <main> (p-4
    // md:p-6 en Dashboard.tsx) solo en esta página, dejando un espacio chico
    // entre la barra superior y el card en vez de pegarlo del todo.
    <div className="size-full rounded-lg border border-gray-200 shadow-sm overflow-hidden -mt-2 md:-mt-5">
      <TabView className="size-full">
        <TabPanel header={<span className="text-sm">Productos</span>}>
          <ProductList />
        </TabPanel>
        <TabPanel header={<span className="text-sm">Fuera de inventario</span>}>
          <CustomSaleItemsList />
        </TabPanel>
      </TabView>
    </div>
  );
};

export default ProductsPage;
