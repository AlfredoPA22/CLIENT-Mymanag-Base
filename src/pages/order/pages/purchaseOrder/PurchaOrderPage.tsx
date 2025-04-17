import { TabPanel, TabView } from "primereact/tabview";
import ProviderList from "../../../provider/pages/ProviderList";
import PurchaseOrderList from "./PurchaseOrderList";
import useAuth from "../../../auth/hooks/useAuth";

const PurchaseOrderPage = () => {
  const { permissions } = useAuth();

  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const panels = [
    {
      header: "Compras",
      permission: ["LIST_AND_CREATE_PURCHASE"],
      content: <PurchaseOrderList />,
    },
    {
      header: "Proveedores",
      permission: ["LIST_AND_CREATE_PROVIDER"],
      content: <ProviderList />,
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

export default PurchaseOrderPage;
