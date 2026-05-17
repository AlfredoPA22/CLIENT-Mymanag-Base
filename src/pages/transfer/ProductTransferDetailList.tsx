import { useMutation, useQuery } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { FC, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../components/datatable/Table";
import TableSkeleton from "../../components/skeleton/TableSkeleton";
import TextLink from "../../components/TextLink/TextLink";
import { DELETE_PRODUCT_FROM_TRANSFER } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER_DETAIL } from "../../graphql/queries/ProductTransfer";
import useTableGlobalFilter from "../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { ROUTES_MOCK } from "../../routes/RouteMocks";
import { stockType } from "../../utils/enums/stockType.enum";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { IProductTransferDetail } from "../../utils/interfaces/ProductTransfer";
import { DataTableColumn } from "../../utils/interfaces/Table";
import { showToast } from "../../utils/toastUtils";
import SerialToTransferDetail from "./SerialToTransferDetail";

interface ProductTransferDetailListProps {
  transferId: string;
  editMode?: boolean;
  onCanApproveChange?: (canApprove: boolean) => void;
}

const ProductTransferDetailList: FC<ProductTransferDetailListProps> = ({
  transferId,
  editMode = true,
  onCanApproveChange,
}) => {
  const dispatch = useDispatch();
  const [visibleSerialDialog, setVisibleSerialDialog] = useState(false);
  const [currentDetailId, setCurrentDetailId] = useState<string | null>(null);

  const [deleteProductFromTransfer] = useMutation(DELETE_PRODUCT_FROM_TRANSFER, {
    refetchQueries: [{ query: LIST_PRODUCT_TRANSFER_DETAIL, variables: { transferId } }],
  });

  const {
    data: { listProductTransferDetail: listDetails } = { listProductTransferDetail: [] },
    loading,
    error,
  } = useQuery(LIST_PRODUCT_TRANSFER_DETAIL, {
    variables: { transferId },
    fetchPolicy: "cache-and-network",
  });

  const currentDetail =
    listDetails?.find((d: IProductTransferDetail) => d._id === currentDetailId) ?? null;

  useEffect(() => {
    if (listDetails && onCanApproveChange) {
      const allComplete = listDetails.every(
        (d: IProductTransferDetail) =>
          d.product.stock_type !== stockType.SERIALIZADO || d.serials.length >= d.quantity
      );
      onCanApproveChange(allComplete);
    }
  }, [listDetails]);

  useEffect(() => {
    if (error) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  }, [error]);

  const handleDeleteProduct = async (transferDetailId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProductFromTransfer({ variables: { transferDetailId } });
      if (data?.deleteProductFromTransfer?.success) {
        showToast({ detail: "Producto eliminado de la transferencia.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const openSerialDialog = (detailId: string) => {
    setCurrentDetailId(detailId);
    setVisibleSerialDialog(true);
  };

  const serialsBodyTemplate = (rowData: IProductTransferDetail) => {
    if (rowData.product.stock_type !== stockType.SERIALIZADO) {
      return <span className="text-gray-400 text-sm">No corresponde</span>;
    }
    const assigned = rowData.serials.length;
    const required = rowData.quantity;
    const complete = assigned >= required;
    return <Tag severity={complete ? "success" : "warning"} value={`${assigned} / ${required}`} />;
  };

  const actionBodyTemplate = (rowData: IProductTransferDetail) => (
    <div className="flex justify-center gap-2">
      {rowData.product.stock_type === stockType.SERIALIZADO && (
        <Button
          tooltip={editMode ? "Gestionar seriales" : "Ver seriales"}
          icon="pi pi-cart-plus"
          raised
          severity="success"
          onClick={() => openSerialDialog(rowData._id)}
        />
      )}
      {editMode && (
        <Button
          tooltip="Eliminar producto"
          icon="pi pi-trash"
          raised
          severity="danger"
          onClick={() => handleDeleteProduct(rowData._id)}
        />
      )}
    </div>
  );

  const [columns] = useState<DataTableColumn<IProductTransferDetail>[]>([
    {
      field: "product.code",
      header: "Código",
      sortable: true,
      style: { width: "10%" },
      body: (rowData: IProductTransferDetail) => (
        <TextLink to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${rowData.product._id}`}>
          {rowData.product.code}
        </TextLink>
      ),
    },
    { field: "product.name", header: "Producto", sortable: true, style: { width: "35%" } },
    { field: "product.stock", header: "Stock origen", sortable: true, style: { textAlign: "center", width: "15%" } },
    { field: "quantity", header: "Cantidad a transferir", sortable: true, style: { textAlign: "center", width: "20%" } },
    { field: "serials", header: "Seriales", style: { textAlign: "center", width: "15%" }, body: serialsBodyTemplate },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loading) return <TableSkeleton />;

  const serialDialog = (
    <Dialog
      className="md:w-[700px] w-[95vw]"
      header={`Seriales — ${currentDetail?.product?.name ?? ""}`}
      visible={visibleSerialDialog}
      onHide={() => {
        setVisibleSerialDialog(false);
        setCurrentDetailId(null);
      }}
    >
      {currentDetail && (
        <SerialToTransferDetail
          transferId={transferId}
          transferDetailId={currentDetail._id}
          serials={currentDetail.serials}
          quantity={currentDetail.quantity}
          editMode={editMode}
        />
      )}
    </Dialog>
  );

  return (
    <>
      {/* ── Mobile: cards ─────────────────────────────────────── */}
      <div className="md:hidden mb-2">
        <Card title={`Productos (${listDetails?.length ?? 0})`}>
          {(!listDetails || listDetails.length === 0) && (
            <p className="text-center text-gray-400 py-4 text-sm">Sin productos en la transferencia.</p>
          )}
          <div className="flex flex-col gap-2">
            {listDetails?.map((item: IProductTransferDetail) => {
              const isSerialized = item.product.stock_type === stockType.SERIALIZADO;
              const assigned = item.serials.length;
              const required = item.quantity;
              const serialsComplete = assigned >= required;

              return (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 overflow-hidden flex-1">
                      <TextLink
                        to={`${ROUTES_MOCK.INVENTORY}${ROUTES_MOCK.PRODUCTS}/detalle/${item.product._id}`}
                        className="text-xs text-blue-600 font-medium"
                      >
                        {item.product.code}
                      </TextLink>
                      <p className="font-semibold text-gray-800 text-sm break-words mt-0.5">
                        {item.product.name}
                      </p>
                    </div>
                    {isSerialized && (
                      <Tag
                        severity={serialsComplete ? "success" : "warning"}
                        value={`${assigned}/${required}`}
                        className="shrink-0"
                      />
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                    <span>
                      <span className="text-gray-400">Stock: </span>
                      <span className="font-semibold">{item.product.stock}</span>
                    </span>
                    <span>
                      <span className="text-gray-400">Cant.: </span>
                      <span className="font-semibold">{item.quantity}</span>
                    </span>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {isSerialized && (
                      <Button
                        icon="pi pi-cart-plus"
                        size="small"
                        severity="success"
                        raised
                        label={editMode ? "Seriales" : "Ver seriales"}
                        onClick={() => openSerialDialog(item._id)}
                      />
                    )}
                    {editMode && (
                      <Button
                        icon="pi pi-trash"
                        size="small"
                        severity="danger"
                        raised
                        onClick={() => handleDeleteProduct(item._id)}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* ── Desktop: tabla ─────────────────────────────────────── */}
      <div className="hidden md:block" id="transfer-detail-table">
        <Card title={`Productos (${listDetails?.length ?? 0})`}>
          <Table
            columns={columns}
            data={listDetails ?? []}
            emptyMessage="Sin productos en la transferencia."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
          />
        </Card>
      </div>

      {serialDialog}
    </>
  );
};

export default ProductTransferDetailList;
