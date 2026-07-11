import { FC } from "react";
import { TabPanel, TabView } from "primereact/tabview";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import AddManySerialsToDetailForm from "./AddManySerialsToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  purchaseOrderId: string;
  purchaseOrderDetailId: string;
  editMode?: boolean;
  remainingSerials?: number;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  purchaseOrderDetailId,
  purchaseOrderId,
  editMode = true,
  remainingSerials,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {editMode && (
        <TabView>
          <TabPanel header="Individual">
            <AddSerialToDetailForm
              purchaseOrderId={purchaseOrderId}
              purchaseOrderDetailId={purchaseOrderDetailId}
            />
          </TabPanel>
          <TabPanel header="Por rango">
            <AddManySerialsToDetailForm
              purchaseOrderId={purchaseOrderId}
              purchaseOrderDetailId={purchaseOrderDetailId}
              remainingSerials={remainingSerials}
            />
          </TabPanel>
        </TabView>
      )}

      <SerialByDetailList
        purchaseOrderId={purchaseOrderId}
        purchaseOrderDetailId={purchaseOrderDetailId}
        editMode={editMode}
      />
    </div>
  );
};

export default SerialToDetail;