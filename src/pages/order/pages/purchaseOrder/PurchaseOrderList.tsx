import { useApolloClient, useMutation } from "@apollo/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../../../components/datatable/Table";
import LabelInput from "../../../../components/labelInput/LabelInput";
import { DELETE_PURCHASE_ORDER } from "../../../../graphql/mutations/PurchaseOrder";
import { LIST_PRODUCT } from "../../../../graphql/queries/Product";
import {
  FIND_PURCHASE_ORDER_TO_PDF,
  LIST_PURCHASE_ORDER,
} from "../../../../graphql/queries/PurchaseOrder";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { currencySymbol } from "../../../../utils/constants/currencyConstants";
import { orderStatus } from "../../../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import {
  IPurchaseOrder,
  IPurchaseOrderToPDF,
} from "../../../../utils/interfaces/PurchaseOrder";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import usePurchaseOrderList from "../../hooks/usePurchaseOrderList";
import { getDate } from "../../utils/getDate";
import { getStatus } from "../../utils/getStatus";

const PurchaseOrderList = () => {
  const { listPurchaseOrder, loadingListPurchaseOrder } =
    usePurchaseOrderList();
  const navigate = useNavigate();

  const client = useApolloClient();

  const [DeletePurchaseOrder] = useMutation(DELETE_PURCHASE_ORDER, {
    refetchQueries: [
      {
        query: LIST_PURCHASE_ORDER,
      },
      {
        query: LIST_PRODUCT,
      },
    ],
  });

  const statusBodyTemplate = (rowData: IPurchaseOrder) => {
    const status = getStatus(rowData.status);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag severity={severity as "danger" | "success" | "info" | "warning"}>
          {label}
        </Tag>
      );
    }
    return null;
  };

  const dateBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.date) {
      const date = getDate(rowData.date);
      return <Tag>{date}</Tag>;
    }
    return null;
  };

  const prodiverBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.provider) {
      return (
        <label>
          ({rowData.provider.code}) {rowData.provider.name}
        </label>
      );
    }
    return null;
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-end">
        <Button
          label="Nueva orden de compra"
          severity="success"
          onClick={() => navigate("/order/newPurchaseOrder")}
          rounded
        />
      </div>
    );
  };

  const handleDeletePurchaseOrder = async (purchaseOrderId: string) => {
    try {
      const { data } = await DeletePurchaseOrder({
        variables: {
          purchaseOrderId,
        },
      });
      if (data.deletePurchaseOrder.success) {
        showToast({
          detail: "Orden de compra eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const confirmDeletePurchaseOrder = async (purchaseOrderId: string) => {
    confirmDialog({
      message: "¿Esta seguro que desea eliminar la compra?",
      header: "Confirmacion",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleDeletePurchaseOrder(purchaseOrderId),
    });
  };

  const handleGeneratePDF = async (purchaseOrderId: string) => {
    try {
      const { data } = await client.query({
        query: FIND_PURCHASE_ORDER_TO_PDF,
        variables: {
          purchaseOrderId,
        },
        fetchPolicy: "network-only",
      });

      generatePDF(data.findPurchaseOrderToPDF);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const generatePDF = (data: IPurchaseOrderToPDF) => {
    const doc = new jsPDF();

    // Título del documento
    doc.setFontSize(18);
    doc.text("Orden de Compra", 75, 20);

    // Datos de la orden de compra
    doc.setFontSize(12);
    doc.text(`Código: ${data.purchaseOrder.code}`, 14, 30);
    doc.text(`Proveedor: ${data.purchaseOrder.provider.name}`, 14, 35);
    doc.text(`Total: ${data.purchaseOrder.total} ${currencySymbol}`, 14, 40);
    doc.text(`Fecha: ${getDate(data.purchaseOrder.date)}`, 150, 30);
    doc.text(`Estado: ${data.purchaseOrder.status}`, 150, 35);

    // Cabeceras para la tabla
    const columns = [
      { title: "Código de Producto" },
      { title: "Nombre de Producto" },
      { title: "Marca" },
      { title: "Cantidad" },
      { title: "Precio compra" },
      { title: "Subtotal" },
      { title: "Seriales" },
    ];

    // Datos para la tabla
    const rows = data.purchaseOrderDetail.map((detail) => [
      detail.purchaseOrderDetail.product.code,
      detail.purchaseOrderDetail.product.name,
      detail.purchaseOrderDetail.product.brand.name,
      detail.purchaseOrderDetail.quantity,
      `${detail.purchaseOrderDetail.purchase_price} ${currencySymbol}`,
      `${detail.purchaseOrderDetail.subtotal} ${currencySymbol}`,
      detail.productSerial.map((serial) => serial.serial).join(", "),
    ]);

    // Añadir la tabla al documento
    autoTable(doc, {
      head: [columns],
      headStyles: { fillColor: "#2d66ea" },
      body: rows,
      startY: 50,
      theme: "grid",
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 45 },
        2: { cellWidth: 20 },
        3: { cellWidth: 20 },
        4: { cellWidth: 20 },
        5: { cellWidth: 20 },
        6: { cellWidth: 35 },
      },
    });

    // Guardar el PDF
    doc.save("orden_de_compra.pdf");
  };

  const actionBodyTemplate = (rowData: IPurchaseOrder) => {
    if (rowData.status === orderStatus.BORRADOR) {
      if (rowData.total === 0) {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar compra"
              icon="pi pi-align-justify"
              rounded
              severity="info"
              aria-label="Cancel"
              onClick={() =>
                navigate(`/order/editPurchaseOrder/${rowData._id}`)
              }
            />

            <Button
              tooltip="Eliminar compra"
              icon="pi pi-times"
              rounded
              severity="danger"
              aria-label="Cancel"
              onClick={() => confirmDeletePurchaseOrder(rowData._id)}
            />
          </div>
        );
      } else {
        return (
          <div className="flex justify-center gap-2">
            <Button
              tooltip="Completar compra"
              icon="pi pi-align-justify"
              rounded
              severity="info"
              aria-label="Cancel"
              onClick={() =>
                navigate(`/order/editPurchaseOrder/${rowData._id}`)
              }
            />
            <Button
              tooltip="Imprimir compra"
              icon="pi pi-download"
              rounded
              severity="warning"
              aria-label="Cancel"
              onClick={() => handleGeneratePDF(rowData._id)}
            />
          </div>
        );
      }
    } else {
      return (
        <div className="flex justify-center gap-2">
          <Button
            tooltip="Ver detalle de compra"
            icon="pi pi-eye"
            rounded
            severity="info"
            aria-label="Cancel"
            onClick={() => navigate(`/order/viewPurchaseOrder/${rowData._id}`)}
          />
          <Button
            tooltip="Imprimir compra"
            icon="pi pi-download"
            rounded
            severity="warning"
            aria-label="Cancel"
            onClick={() => handleGeneratePDF(rowData._id)}
          />
          <Button
            tooltip="Eliminar compra"
            icon="pi pi-times"
            rounded
            severity="danger"
            aria-label="Cancel"
            onClick={() => confirmDeletePurchaseOrder(rowData._id)}
          />
        </div>
      );
    }
  };

  const [columns] = useState<DataTableColumn<IPurchaseOrder>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
    },
    {
      field: "date",
      header: "Fecha",
      body: dateBodyTemplate,
    },
    {
      field: "provider.name",
      header: "Proveedor",
      sortable: true,
      body: prodiverBodyTemplate,
    },
    {
      field: "total",
      header: "Total",
      sortable: true,
      style: { textAlign: "center" },
      body: (rowData: IPurchaseOrder) => (
        <LabelInput
          className="justify-center"
          label={`${rowData.total} ${currencySymbol}`}
        />
      ),
    },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  return (
    <Card
      className="size-full"
      title="Lista de Compras"
      subTitle={tableHeaderTemplate}
    >
      {loadingListPurchaseOrder ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listPurchaseOrder}
            emptyMessage="Sin compras."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </div>
      )}
    </Card>
  );
};

export default PurchaseOrderList;
