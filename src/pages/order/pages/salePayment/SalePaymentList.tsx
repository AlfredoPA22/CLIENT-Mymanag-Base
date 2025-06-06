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
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import {
  IDetailSalePayment,
  ISalePayment,
} from "../../../../utils/interfaces/SalePayment";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { generateHistoryPDF } from "../../utils/generateSalePaymentHistoryPDF";
import { generatePDF } from "../../utils/generateSalePaymentPDF";
import { getDate } from "../../utils/getDate";
import SalePaymentForm from "./SalePaymentForm";

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

  const [DeleteSalePayment] = useMutation(DELETE_SALE_PAYMENT, {
    refetchQueries: [
      { query: LIST_SALE_ORDER },
      {
        query: LIST_SALE_PAYMENT_BY_SALE_ORDER,
        variables: { saleOrderId },
      },
      {
        query: DETAIL_SALE_PAYMENT_BY_SALE_ORDER,
        variables: { saleOrderId },
      },
    ],
  });

  const tableHeaderTemplate = () => {
    return (
      <div className="flex flex-col md:flex-row gap-5 justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de pagos (${listSalePayment.length})`}</h1>
        <section className="flex gap-2">
          {!detailSalePayment.sale_order.is_paid && (
            <Button
              label="Nuevo pago"
              severity="success"
              tooltip="Nuevo Pago"
              tooltipOptions={{ position: "left" }}
              onClick={() => setVisibleForm(true)}
              raised
            />
          )}
          <Button
            tooltip="Imprimir historial"
            tooltipOptions={{ position: "left" }}
            icon="pi pi-download"
            raised
            severity="warning"
            aria-label="Cancel"
            onClick={() =>
              generateHistoryPDF(listSalePayment, detailSalePayment)
            }
          />
        </section>
      </div>
    );
  };

  const dateBodyTemplate = (rowData: ISalePayment) => {
    if (rowData.date) {
      const date = getDate(rowData.date);
      return <Tag>{date}</Tag>;
    }
    return null;
  };

  const handleDeleteSalePayment = async (salePaymentId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await DeleteSalePayment({
        variables: {
          salePaymentId,
        },
      });
      if (data.deleteSalePayment.success) {
        showToast({
          detail: "Pago eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDeleteSalePayment = async (salePaymentId: string) => {
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

  const actionBodyTemplate = (rowData: ISalePayment) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Imprimir comprobante"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-download"
          raised
          severity="warning"
          aria-label="Cancel"
          onClick={() => generatePDF(rowData, detailSalePayment)}
        />

        <Button
          tooltip="Anular y eliminar pago"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => confirmDeleteSalePayment(rowData._id)}
        />
      </div>
    );
  };

  const [columns] = useState<DataTableColumn<ISalePayment>[]>([
    {
      field: "date",
      header: "Fecha",
      sortable: true,
      body: dateBodyTemplate,
    },
    {
      field: "note",
      header: "Nota",
      style: { width: "40%" },
    },
    {
      field: "payment_method",
      header: "Metodo de pago",
      sortable: true,
      style: { width: "15%", textAlign: "center" },
    },
    {
      field: "amount",
      header: "Monto",
      sortable: true,
      body: (rowData: ISalePayment) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.amount} ${currencySymbol}`}
        />
      ),
      style: { width: "20%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingSalePayment || loadingDetailSalePayment) {
    return <TableSkeleton />;
  }
  return (
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listSalePayment}
        emptyMessage="Sin pagos."
        size="small"
        dataFilters={filters}
        tableHeader={renderFilterInput}
        actionBodyTemplate={actionBodyTemplate}
      />

      {!detailSalePayment.sale_order.is_paid && (
        <Dialog
          header="Nuevo Pago"
          visible={visibleForm}
          onHide={() => setVisibleForm(false)}
        >
          <SalePaymentForm
            setVisibleSalePaymentForm={setVisibleForm}
            saleOrderId={detailSalePayment.sale_order._id}
          />
        </Dialog>
      )}
    </Card>
  );
};

export default SalePaymentList;
