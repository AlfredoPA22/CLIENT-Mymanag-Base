import { useApolloClient, useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import QrPaymentModal from "../../../../components/qrPayment/QrPaymentModal";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import RowActionButtons, { RowAction } from "../../../../components/table/RowActionButtons";
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
import { formatAmount } from "../../../../utils/currency";

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
  const [showQrDialog, setShowQrDialog] = useState(false);
  const [qrAmount, setQrAmount] = useState(0);
  const dispatch = useDispatch();
  const { currency } = useAuth();
  const apolloClient = useApolloClient();

  const [DeleteSalePayment] = useMutation(DELETE_SALE_PAYMENT, {
    refetchQueries: [
      { query: LIST_SALE_ORDER },
      { query: LIST_SALE_PAYMENT_BY_SALE_ORDER, variables: { saleOrderId } },
      { query: DETAIL_SALE_PAYMENT_BY_SALE_ORDER, variables: { saleOrderId } },
    ],
  });

  const handleRequestQr = (amount: number) => {
    setQrAmount(amount);
    setShowQrDialog(true);
  };

  const handleQrConfirmed = () => {
    setVisibleForm(false);
    apolloClient.refetchQueries({
      include: [LIST_SALE_ORDER, LIST_SALE_PAYMENT_BY_SALE_ORDER, DETAIL_SALE_PAYMENT_BY_SALE_ORDER],
    });
  };

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

  const confirmDeleteSalePayment = (rowData: ISalePayment) => {
    const isQr = rowData.payment_method === "QR";
    confirmDialog({
      message: isQr ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-red-600 font-bold text-base">
            <i className="pi pi-exclamation-triangle text-2xl" />
            <span>¡Este pago se cobró por QR!</span>
          </div>
          <p className="text-sm bg-red-50 border border-red-200 rounded px-3 py-2 text-red-700">
            El dinero de <strong>{formatAmount(rowData.amount)} {rowData.currency ?? currency}</strong> ya se recibió y la devolución de ese monto debe gestionarse manualmente.
          </p>
          <p className="text-sm text-gray-700">¿Deseas eliminarlo de todas formas?</p>
        </div>
      ) : (
        "¿Esta seguro que desea eliminar el pago?"
      ),
      header: "Confirmacion",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      rejectLabel: "Cancelar",
      acceptLabel: "Aceptar",
      accept: () => handleDeleteSalePayment(rowData._id),
    });
  };

  const buildSalePaymentActions = (rowData: ISalePayment): RowAction[] => [
    { label: "Imprimir comprobante", icon: "pi pi-download", severity: "warning", onClick: () => generatePDF(rowData, currency, detailSalePayment) },
    { label: "Anular y eliminar pago", icon: "pi pi-trash", severity: "danger", onClick: () => confirmDeleteSalePayment(rowData) },
  ];

  const actionBodyTemplate = (rowData: ISalePayment) => (
    <RowActionButtons actions={buildSalePaymentActions(rowData)} />
  );

  const [columns] = useState<DataTableColumn<ISalePayment>[]>([
    { field: "date", header: "Fecha", sortable: true, body: dateBodyTemplate },
    { field: "note", header: "Nota", style: { width: "40%" } },
    { field: "payment_method", header: "Metodo de pago", sortable: true, style: { width: "15%", textAlign: "center" } },
    {
      field: "amount", header: "Monto", sortable: true,
      body: (rowData: ISalePayment) => (
        <LabelInput className="justify-center" label={`${formatAmount(rowData.amount)} ${rowData.currency ?? currency}`} />
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
        detailSalePayment={detailSalePayment}
        onRequestQr={handleRequestQr}
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
              <span className="text-base font-bold text-green-700">{formatAmount(item.amount)} {item.currency ?? currency}</span>
              <RowActionButtons actions={buildSalePaymentActions(item)} size="small" />
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

      <QrPaymentModal
        visible={showQrDialog}
        onHide={() => setShowQrDialog(false)}
        amount={qrAmount}
        referenceId={`ABONO-${saleOrderId}`}
        description={`Abono a venta ${saleOrderId}`}
        saleOrderId={saleOrderId}
        type="abono_credito"
        onConfirmed={handleQrConfirmed}
      />
    </>
  );
};

export default SalePaymentList;
