import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { textEditor } from "../../../../components/textEditor/textEditor";
import {
  DELETE_WAREHOUSE,
  UPDATE_WAREHOUSE,
} from "../../../../graphql/mutations/Warehouse";
import { LIST_WAREHOUSE } from "../../../../graphql/queries/Warehouse";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { IWarehouse } from "../../../../utils/interfaces/Warehouse";
import { showToast } from "../../../../utils/toastUtils";
import { Status } from "../../../../utils/types/StatusType";
import useWarehouseList from "../../hooks/useWarehouseList";
import WarehouseDetail from "./WarehouseDetail";
import WarehouseForm from "./WarehouseForm";
import { Card } from "primereact/card";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

const WarehouseList = () => {
  const { listWarehouse, loadingListWarehouse } = useWarehouseList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<IWarehouse>();
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<IWarehouse | null>(null);

  const dispatch = useDispatch();

  const [deleteWarehouse] = useMutation(DELETE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });

  const [updateWarehouse] = useMutation(UPDATE_WAREHOUSE, {
    refetchQueries: [{ query: LIST_WAREHOUSE }],
  });

  const getStatus = (rowData: IWarehouse): Status | null => {
    switch (rowData.is_active) {
      case false:
        return { severity: "danger", label: "Inactivo" };
      case true:
        return { severity: "success", label: "Activo" };
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData: IWarehouse) => {
    const status = getStatus(rowData);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag value={rowData.is_active} severity={severity as "danger" | "success"}>
          {label}
        </Tag>
      );
    }
    return null;
  };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de almacenes (${listWarehouse.length})`}</h1>
        <Button
          id="btn-new-warehouse"
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo almacén"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteWarehouse = async (warehouseId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteWarehouse({ variables: { warehouseId } });
      if (data.deleteWarehouse.success) {
        showToast({ detail: "Almacén eliminado.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IWarehouse) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="eliminar almacén"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteWarehouse(rowData._id)}
        />
      </div>
    );
  };

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<IWarehouse[]>) => {
    setCurrentWarehouse(e.value);
    setVisibleDetail(true);
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.name === "") {
        showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
      } else {
        const { data } = await updateWarehouse({
          variables: {
            warehouseId: e.newData._id,
            name: e.newData.name,
            description: e.newData.description,
          },
        });
        if (data) {
          showToast({ detail: "Almacén actualizado.", severity: ToastSeverity.Success });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleMobileEdit = (item: IWarehouse) => {
    setMobileEditData({ ...item });
    setMobileEditVisible(true);
  };

  const handleMobileEditSave = async () => {
    if (!mobileEditData) return;
    if (!mobileEditData.name.trim()) {
      showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
      return;
    }
    try {
      dispatch(setIsBlocked(true));
      await updateWarehouse({
        variables: {
          warehouseId: mobileEditData._id,
          name: mobileEditData.name,
          description: mobileEditData.description,
        },
      });
      showToast({ detail: "Almacén actualizado.", severity: ToastSeverity.Success });
      setMobileEditVisible(false);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<IWarehouse>[]>([
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "20%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "description",
      header: "Descripcion",
      style: { width: "40%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "is_active",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "20%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListWarehouse) {
    return <LoadingSpinner />;
  }

  const dialogs = (
    <>
      <Dialog
        header="Nuevo Almacén"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <WarehouseForm setVisibleForm={setVisibleForm} />
      </Dialog>
      <Dialog
        className="md:w-[90vw] w-[95vw]"
        visible={visibleDetail}
        header={currentWarehouse && `Detalle de almacén`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentWarehouse && <WarehouseDetail warehouse={currentWarehouse} />}
      </Dialog>
      <Dialog
        header="Editar Almacén"
        visible={mobileEditVisible}
        onHide={() => setMobileEditVisible(false)}
        className="w-[95vw]"
      >
        {mobileEditData && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Nombre</label>
              <InputText
                value={mobileEditData.name}
                onChange={(e) => setMobileEditData({ ...mobileEditData, name: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Descripción</label>
              <InputText
                value={mobileEditData.description ?? ""}
                onChange={(e) => setMobileEditData({ ...mobileEditData, description: e.target.value })}
                className="w-full"
              />
            </div>
            <Button
              label="Guardar"
              icon="pi pi-check"
              severity="success"
              onClick={handleMobileEditSave}
              className="w-full mt-1"
            />
          </div>
        )}
      </Dialog>
    </>
  );

  return (
    <>
      {/* ── Mobile ─────────────────────────────────────────── */}
      <div className="md:hidden flex flex-col gap-3 p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold">{`Almacenes (${listWarehouse.length})`}</h1>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            severity="success"
            size="small"
            onClick={() => setVisibleForm(true)}
            raised
          />
        </div>

        {(!listWarehouse || listWarehouse.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin almacenes.</p>
        )}

        {listWarehouse.map((item) => {
          const status = getStatus(item);
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer active:bg-gray-50"
              onClick={() => { setCurrentWarehouse(item); setVisibleDetail(true); }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 overflow-hidden flex-1">
                  <p className="font-bold text-gray-800 text-sm break-words">{item.name}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-0.5 break-words">{item.description}</p>
                  )}
                </div>
                {status && (
                  <Tag severity={status.severity as "danger" | "success"} className="shrink-0">
                    {status.label}
                  </Tag>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    icon="pi pi-pencil"
                    size="small"
                    severity="secondary"
                    raised
                    onClick={() => handleMobileEdit(item)}
                  />
                  <Button
                    icon="pi pi-trash"
                    size="small"
                    severity="danger"
                    raised
                    onClick={() => handleDeleteWarehouse(item._id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="warehouse-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
        <Table
          columns={columns}
          data={listWarehouse}
          emptyMessage="Sin almacenes."
          size="small"
          actionBodyTemplate={actionBodyTemplate}
          dataFilters={filters}
          tableHeader={renderFilterInput}
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          onSelectionChange={handleSelectionChange}
        />
      </Card>

      {dialogs}
    </>
  );
};

export default WarehouseList;
