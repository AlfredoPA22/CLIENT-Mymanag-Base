import { useQuery } from "@apollo/client";
import { SelectButton } from "primereact/selectbutton";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DETAIL_COMPANY } from "../../../../graphql/queries/Company";
import { resetSaleOrder } from "../../../../redux/slices/saleOrderSlice";
import { RootState } from "../../../../redux/store";
import SaleOrderDetailForm from "./SaleOrderDetailForm";
import SaleOrderDetailList from "./SaleOrderDetailList";
import SaleOrderForm from "./SaleOrderForm";
import SaleOrderPOS from "./SaleOrderPOS";

const MODE_OPTIONS = [
  { label: "Formulario clásico", value: "CLASICO" },
  { label: "Modo rápido", value: "RAPIDO" },
];

const CreateSaleOrder = () => {
  const dispatch = useDispatch();
  const [mode, setMode] = useState<"CLASICO" | "RAPIDO">("CLASICO");

  const { data: companyData } = useQuery(DETAIL_COMPANY);
  const posModeEnabled = !!companyData?.detailCompany?.pos_sale_mode_enabled;

  const { saleOrderInitialized, saleOrderData } = useSelector(
    (state: RootState) => state.saleOrderSlice
  );

  useEffect(() => {
    return () => {
      dispatch(resetSaleOrder());
    };
  }, []);

  return (
    <div className="size-full">
      {posModeEnabled && (
        <div className="flex justify-center mb-4">
          <SelectButton value={mode} options={MODE_OPTIONS} onChange={(e) => e.value && setMode(e.value)} />
        </div>
      )}

      {posModeEnabled && mode === "RAPIDO" ? (
        <SaleOrderPOS />
      ) : (
        <>
          <SaleOrderForm />
          {saleOrderInitialized && saleOrderData?._id && (
            <>
              <SaleOrderDetailForm saleOrderId={saleOrderData?._id} />
              <SaleOrderDetailList saleOrderId={saleOrderData?._id} />
            </>
          )}
        </>
      )}
    </div>
  );
};

export default CreateSaleOrder;
