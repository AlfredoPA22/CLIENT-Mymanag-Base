import { TabPanel, TabView } from "primereact/tabview";
import ProviderList from "../../../provider/pages/ProviderList";
import PurchaseOrderList from "./PurchaseOrderList";

const PurchaseOrderPage = () => {
  return (
    <TabView className="size-full">
      <TabPanel header="Compras">
        <PurchaseOrderList />
      </TabPanel>
      <TabPanel header="Proveedores">
        <ProviderList />
      </TabPanel>
    </TabView>
  );
};

export default PurchaseOrderPage;
