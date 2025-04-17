import { TabPanel, TabView } from "primereact/tabview";
import ProductList from "./ProductList";
import BrandList from "./BrandList";
import CategoryList from "./CategoryList";
import WarehouseList from "./WarehouseList";
import useAuth from "../../auth/hooks/useAuth";

const ProductPage = () => {
  const { permissions } = useAuth();

  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const panels = [
    {
      header: "Productos",
      permission: ["LIST_AND_CREATE_PRODUCT"],
      content: <ProductList />,
    },
    {
      header: "Marcas",
      permission: ["LIST_AND_CREATE_BRAND"],
      content: <BrandList />,
    },
    {
      header: "Categorias",
      permission: ["LIST_AND_CREATE_CATEGORY"],
      content: <CategoryList />,
    },
    {
      header: "Almacenes",
      permission: ["LIST_AND_CREATE_WAREHOUSE"],
      content: <WarehouseList />,
    },
  ];

  return (
    <TabView className="size-full">
      {panels
        .filter((panel) => hasPermission(panel.permission))
        .map((panel, index) => (
          <TabPanel header={panel.header} key={index}>
            {panel.content}
          </TabPanel>
        ))}
    </TabView>
  );
};

export default ProductPage;
