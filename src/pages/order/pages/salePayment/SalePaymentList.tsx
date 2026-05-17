import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import TableSkeleton from "../../../../components/skeleton/TableSkeleton";
import { DELETE_SALE_PAYMENT } from "../../../../graphql/mutations/SalePayment";
import { LIST_SALE_ORDER } from "../../../../graphql/queries/SaleOrder";
import {
  DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
  LIST_SALE_PAYMENT_BY_SALE_ORDER,
} from "../../../../graphql/queries/SalePayment";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import {
  IDetailSalePayment,
  ISalePayment,
} from "../../../../utils/interfaces/SalePayment";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { generateHistoryPDF } from "../../utils/generateSalePaymentHistoryPDF";
import { generatePDF } from "../../utils/generateSalePaymentPDF";
import { getDate } from "../../utils/getDate";
import SalePaymentForm from "./SalePaymentForm";
import useAuth from "../../../auth/hooks/useAuth";

interface SalePaymentListProps {
  listSalePayment: ISalePayment[];
  loadingSalePayment: boolean;
  detailSalePayment: IDetailSalePayment;
  loadingDetailSalePayment: boolean;
  saleOrderId: string;
}

const SalePaymentList: FC<SalePaymentListProps> = ({
  listSalePayment,
  loadingSalePayment,
  detailSalePayment,
  loadingDetailSalePayment,
  saleOrderId,
}) => {
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const dispatch = useDispatch();
  const { currency } = useAuth();

  const [DeleteSalePayment] = useMutation(DELETE_SALE_PAYMENT, {
    refetchQueries: [
      { query: LIST_SALE_ORDER },
      { query: LIST_SALE_PAYMENT_BY_SALE_ORDER, variables: { saleOrderId } },
      { query: DETAIL_SALE_PAYMENT_BY_SALE_ORDER, variables: { saleOrderId } },
    ],
  });

  const canAddPayment =
    !detailSalePayment?.sale_order?.is_paid &&
    detailSalePayment?.sale_order?.status !== orderStatus.DEVUELTO;

  const tableHeaderTemplate = () => (
    <div className="flex flex-col md:flex-row gap-5 justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Lista de pagos (${listSalePayment.length})`}</h1>
      <section className="flex gap-2">
        {canAddPayment && (
          <Button label="Nuevo pago" severity="success"
            tooltip="Nuevo Pago" tooltipOptions={{ position: "left" }}
            onClick={() => setVisibleForm(true)} raised />
        )}
        <Button tooltip="Imprimir historial" tooltipOptions={{ position: "left" }}
          icon="pi pi-download" raised severity="warning"
          onClick={() => generateHistoryPDF(listSalePayment, currency, detailSalePayment)} />
      </section>
    </div>
  );

  const dateBodyTemplate = (rowData: ISalePayment) =>
    rowData.date ? <Tag>{getDate(rowData.date)}</Tag> : null;

  const handleDeleteSalePayment = async (salePaymentId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await DeleteSalePayment({ variables: { salePaymentId } });
      if (data.deleteSalePayment.success) {
        showToast({ detail: "Pago eliminado.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDeleteSalePayment = (salePaymentId: string) => {
    confirmDialog({
      message: "¿Esta seguro que desea eliminar el pago?",
      header: "Confirmacion",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      rejectLabel: "Cancelar",
      acceptLabel: "Aceptar",
      accept: () => handleDeleteSalePayment(salePaymentId),
    });
  };

  const actionBodyTemplate = (rowData: ISalePayment) => (
    <div className="flex justify-center gap-2">
      <Button tooltip="Imprimir comprobante" tooltipOptions={{ position: "left" }}
        icon="pi pi-download" raised severity="warning"
        onClick={() => generatePDF(rowData, currency, detailSalePayment)} />
      <Button tooltip="Anular y eliminar pago" tooltipOptions={{ position: "left" }}
        icon="pi pi-trash" raised severity="danger"
        onClick={() => confirmDeleteSalePayment(rowData._id)} />
    </div>
  );

  const [columns] = useState<DataTableColumn<ISalePayment>[]>([
    { field: "date", header: "Fecha", sortable: true, body: dateBodyTemplate },
    { field: "note", header: "Nota", style: { width: "40%" } },
    { field: "payment_method", header: "Metodo de pago", sortable: true, style: { width: "15%", textAlign: "center" } },
    {
      field: "amount", header: "Monto", sortable: true,
      body: (rowData: ISalePayment) => (
        <LabelInput className="justify-center" label={`${rowData.amount} ${currency}`} />
      ),
      style: { width: "20%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingSalePayment || loadingDetailSalePayment) return <TableSkeleton />;

  const paymentDialog = canAddPayment && (
    <Dialog
      header="Nuevo Pago"
      visible={visibleForm}
      onHide={() => setVisibleForm(false)}
      className="w-[95vw] md:w-auto"
    >
      <SalePaymentForm
        setVisibleSalePaymentForm={setVisibleForm}
        saleOrderId={detailSalePayment.sale_order._id}
      />
    </Dialog>
  );

  return (
    <>
      {/* ── Mobile ────────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{`Pagos (${listSalePayment.length})`}</h1>
          <div className="flex gap-2">
            {canAddPayment && (
              <Button label="Nuevo" icon="pi pi-plus" severity="success" size="small" raised
                onClick={() => setVisibleForm(true)} />
            )}
            <Button icon="pi pi-download" severity="warning" size="small" raised
              onClick={() => generateHistoryPDF(listSalePayment, currency, detailSalePayment)} />
          </div>
        </div>

        {listSalePayment.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin pagos registrados.</p>
        )}

        {listSalePayment.map((item: ISalePayment) => (
          <div key={item._id} className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-2">
              {item.date && <Tag className="text-xs">{getDate(item.date)}</Tag>}
              <Tag severity="secondary" className="text-xs shrink-0">{item.payment_method}</Tag>
            </div>
            {item.note && (
              <p className="text-xs text-gray-500 mt-1.5 break-words">{item.note}</p>
            )}
            <div className="flex items-center justify-between mt-2">
              <span className="text-base font-bold text-green-700">{item.amount} {currency}</span>
              <div className="flex gap-2">
                <Button icon="pi pi-download" size="small" severity="warning" raised
                  onClick={() => generatePDF(item, currency, detailSalePayment)} />
                <Button icon="pi pi-trash" size="small" severity="danger" raised
                  onClick={() => confirmDeleteSalePayment(item._id)} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop ───────────────────────────────────────────── */}
      <Card className="py-2 hidden md:block" header={tableHeaderTemplate}>
        <Table
          columns={columns}
          data={listSalePayment}
          emptyMessage="Sin pagos."
          size="small"
          dataFilters={filters}
          tableHeader={renderFilterInput}
          actionBodyTemplate={actionBodyTemplate}
        />
      </Card>

      {paymentDialog}
    </>
  );
};

export default SalePaymentList;
