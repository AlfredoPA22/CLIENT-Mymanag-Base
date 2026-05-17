import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { confirmDialog } from "primereact/confirmdialog";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import Table from "../../components/datatable/Table";
import { DELETE_PRODUCT_TRANSFER } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER } from "../../graphql/queries/ProductTransfer";
import useTableGlobalFilter from "../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { orderStatus } from "../../utils/enums/orderStatus.enum";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { IProductTransfer } from "../../utils/interfaces/ProductTransfer";
import { DataTableColumn } from "../../utils/interfaces/Table";
import { showToast } from "../../utils/toastUtils";
import { getDate } from "../order/utils/getDate";
import { getStatus } from "../order/utils/getStatus";
import useAuth from "../auth/hooks/useAuth";
import useProductTransferList from "./hooks/useProductTransferList";

const ProductTransferList = () => {
  const { listProductTransfer, loadingListProductTransfer } =
    useProductTransferList();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { permissions } = useAuth();

  const canCreate = permissions.includes("CREATE_TRANSFER");
  const canDelete = permissions.includes("DELETE_TRANSFER");
  const canEdit = permissions.includes("EDIT_TRANSFER");

  const [deleteProductTransfer] = useMutation(DELETE_PRODUCT_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER }],
  });

  const handleDelete = async (transferId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProductTransfer({ variables: { transferId } });
      if (data?.deleteProductTransfer?.success) {
        showToast({ detail: "Transferencia eliminada.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const confirmDelete = (transferId: string) => {
    confirmDialog({
      message: "¿Está seguro que desea eliminar esta transferencia?",
      header: "Confirmación",
      icon: "pi pi-info-circle",
      defaultFocus: "reject",
      acceptClassName: "p-button-danger",
      accept: () => handleDelete(transferId),
    });
  };

  const statusBodyTemplate = (rowData: IProductTransfer) => {
    const status = getStatus(rowData.status);
    if (status) {
      return (
        <Tag severity={status.severity as "danger" | "success" | "info" | "warning"}>
          {status.label}
        </Tag>
      );
    }
    return null;
  };

  const dateBodyTemplate = (rowData: IProductTransfer) => {
    const date = getDate(rowData.date);
    return date ? <Tag>{date}</Tag> : null;
  };

  const routeBodyTemplate = (rowData: IProductTransfer) => (
    <span className="text-sm">
      {rowData.origin_warehouse?.name}{" "}
      <span className="text-gray-400 mx-1">→</span>
      {rowData.destination_warehouse?.name}
    </span>
  );

  const actionBodyTemplate = (rowData: IProductTransfer) => (
    <div className="flex justify-center gap-2">
      {rowData.status === orderStatus.BORRADOR && canEdit && (
        <Button
          tooltip="Editar transferencia"
          icon="pi pi-pencil"
          raised
          severity="info"
          onClick={() =>
            navigate(`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.EDIT_TRANSFER}/${rowData._id}`)
          }
        />
      )}
      {rowData.status === orderStatus.BORRADOR && canDelete && (
        <Button
          tooltip="Eliminar transferencia"
          icon="pi pi-trash"
          raised
          severity="danger"
          onClick={() => confirmDelete(rowData._id)}
        />
      )}
    </div>
  );

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IProductTransfer[]>
  ) => {
    navigate(`${ROUTES_MOCK.TRANSFERS}/detalle/${e.value._id}`);
  };

  const tableHeaderTemplate = () => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Transferencias (${listProductTransfer?.length ?? 0})`}</h1>
      {canCreate && (
        <Button
          id="btn-new-transfer"
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva transferencia"
          tooltipOptions={{ position: "left" }}
          raised
          onClick={() => navigate(`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.NEW_TRANSFER}`)}
        />
      )}
    </div>
  );

  const [columns] = useState<DataTableColumn<IProductTransfer>[]>([
    { field: "code", header: "Código", sortable: true },
    { field: "date", header: "Fecha", body: dateBodyTemplate },
    { field: "origin_warehouse.name", header: "Origen → Destino", body: routeBodyTemplate },
    { field: "created_by.user_name", header: "Creado por", sortable: true },
    {
      field: "status",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProductTransfer) {
    return <LoadingSpinner />;
  }

  return (
    <>
      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">
            {`Transferencias (${listProductTransfer?.length ?? 0})`}
          </h1>
          {canCreate && (
            <Button
              label="Nueva"
              icon="pi pi-plus"
              severity="success"
              size="small"
              raised
              onClick={() => navigate(`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.NEW_TRANSFER}`)}
            />
          )}
        </div>

        {(!listProductTransfer || listProductTransfer.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin transferencias.</p>
        )}

        {listProductTransfer?.map((item) => {
          const status = getStatus(item.status);
          const isBorrador = item.status === orderStatus.BORRADOR;
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer active:bg-gray-50"
              onClick={() => navigate(`${ROUTES_MOCK.TRANSFERS}/detalle/${item._id}`)}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-bold text-gray-800 text-sm">{item.code}</span>
                {status && (
                  <Tag
                    severity={status.severity as "danger" | "success" | "info" | "warning"}
                    className="shrink-0"
                  >
                    {status.label}
                  </Tag>
                )}
              </div>
              <p className="text-sm text-gray-700">
                {item.origin_warehouse?.name}{" "}
                <span className="text-gray-400 mx-1">→</span>
                {item.destination_warehouse?.name}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs text-gray-500">
                <span>{getDate(item.date)}</span>
                <span>{item.created_by?.user_name}</span>
              </div>
              {isBorrador && (canEdit || canDelete) && (
                <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                  {canEdit && (
                    <Button
                      icon="pi pi-pencil"
                      size="small"
                      severity="info"
                      raised
                      onClick={() =>
                        navigate(`${ROUTES_MOCK.TRANSFERS}${ROUTES_MOCK.EDIT_TRANSFER}/${item._id}`)
                      }
                    />
                  )}
                  {canDelete && (
                    <Button
                      icon="pi pi-trash"
                      size="small"
                      severity="danger"
                      raised
                      onClick={() => confirmDelete(item._id)}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="transfer-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
        <Table
          columns={columns}
          data={listProductTransfer ?? []}
          emptyMessage="Sin transferencias."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          dataFilters={filters}
          tableHeader={renderFilterInput}
          onSelectionChange={handleSelectionChange}
        />
      </Card>
    </>
  );
};

export default ProductTransferList;
