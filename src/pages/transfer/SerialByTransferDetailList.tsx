import { useMutation } from "@apollo/client";
import { Card } from "primereact/card";
import { FC, useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../components/datatable/Table";
import RowActionButtons, { RowAction } from "../../components/table/RowActionButtons";
import { REMOVE_SERIAL_FROM_TRANSFER_DETAIL } from "../../graphql/mutations/ProductTransfer";
import { LIST_PRODUCT_TRANSFER_DETAIL } from "../../graphql/queries/ProductTransfer";
import useTableGlobalFilter from "../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../utils/enums/toast.enum";
import { DataTableColumn } from "../../utils/interfaces/Table";
import { showToast } from "../../utils/toastUtils";

interface SerialByTransferDetailListProps {
  transferId: string;
  transferDetailId: string;
  serials: string[];
  quantity: number;
  editMode?: boolean;
}

interface SerialRow {
  serial: string;
}

// Mismo patrón EXACTO (Card + tabla en escritorio + cards en mobile, mismo
// ícono/label de acción, misma estructura de dos filas) que
// SerialByDetailList.tsx de venta/compra. Único ajuste real: acá no hay un
// ProductSerial por fila con su propio almacén/estado (son strings sueltos
// ya reservados para ESTA transferencia), así que esa segunda fila queda
// solo con el botón de acción, igual de bien alineado con un placeholder
// vacío en vez de directamente sacarla.
const SerialByTransferDetailList: FC<SerialByTransferDetailListProps> = ({
  transferId,
  transferDetailId,
  serials,
  quantity,
  editMode = true,
}) => {
  const dispatch = useDispatch();

  const [removeSerial] = useMutation(REMOVE_SERIAL_FROM_TRANSFER_DETAIL, {
    refetchQueries: [
      {
        query: LIST_PRODUCT_TRANSFER_DETAIL,
        variables: { transferId },
      },
    ],
  });

  const handleRemove = async (serial: string) => {
    try {
      dispatch(setIsBlocked(true));
      await removeSerial({ variables: { transferDetailId, serial } });
      showToast({ detail: "Serial eliminado", severity: ToastSeverity.Success });
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const buildSerialActions = (rowData: SerialRow): RowAction[] => [
    { label: "Eliminar serial", icon: "pi pi-trash", severity: "danger", onClick: () => handleRemove(rowData.serial) },
  ];

  const actionBodyTemplate = (rowData: SerialRow) => (
    <RowActionButtons actions={buildSerialActions(rowData)} />
  );

  const [columns] = useState<DataTableColumn<SerialRow>[]>([
    { field: "serial", header: "Serial", sortable: true, style: { width: "100%" } },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  const list: SerialRow[] = serials.map((serial) => ({ serial }));
  const title = `Seriales asignados (${list.length}/${quantity})`;

  return (
    <>
      {/* ── Mobile ────────────────────────────────────────────── */}
      <Card className="md:hidden" title={title}>
        {list.length === 0 && (
          <p className="text-center text-gray-400 py-4 text-sm">Sin seriales asignados.</p>
        )}
        <div className="flex flex-col gap-2">
          {list.map((row) => (
            <div key={row.serial} className="border border-gray-200 rounded-xl px-3 py-2 bg-white shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-mono font-semibold text-gray-800 break-all flex-1">{row.serial}</p>
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span />
                {editMode && (
                  <RowActionButtons actions={buildSerialActions(row)} size="small" />
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Desktop ───────────────────────────────────────────── */}
      <Card className="hidden md:block size-full" title={title}>
        <Table
          columns={columns}
          data={list}
          emptyMessage="Sin seriales asignados."
          size="small"
          {...(editMode && { actionBodyTemplate })}
          dataFilters={filters}
          tableHeader={renderFilterInput}
        />
      </Card>
    </>
  );
};

export default SerialByTransferDetailList;
