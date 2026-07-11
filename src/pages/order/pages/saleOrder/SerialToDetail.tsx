import { FC } from "react";
import { TabPanel, TabView } from "primereact/tabview";
import AddSerialToDetailForm from "./AddSerialToDetailForm";
import AddManySerialsToDetailForm from "./AddManySerialsToDetailForm";
import SerialByDetailList from "./SerialByDetailList";

interface SerialToDetailProps {
  saleOrderId: string;
  saleOrderDetailId: string;
  editMode?: boolean;
  remainingSerials?: number;
}

const SerialToDetail: FC<SerialToDetailProps> = ({
  saleOrderDetailId,
  saleOrderId,
  editMode = true,
  remainingSerials,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {editMode && (
        <TabView>
          <TabPanel header="Uno por uno">
            <AddSerialToDetailForm
              saleOrderId={saleOrderId}
              saleOrderDetailId={saleOrderDetailId}
            />
          </TabPanel>
          <TabPanel header="Por rango">
            <AddManySerialsToDetailForm
              saleOrderId={saleOrderId}
              saleOrderDetailId={saleOrderDetailId}
              remainingSerials={remainingSerials}
            />
          </TabPanel>
        </TabView>
      )}

      <SerialByDetailList
        saleOrderId={saleOrderId}
        saleOrderDetailId={saleOrderDetailId}
        editMode={editMode}
      />
    </div>
  );
};

export default SerialToDetail;