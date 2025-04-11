import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { IWarehouse } from "../../../utils/interfaces/Warehouse";
import { Status } from "../../../utils/types/StatusType";
import useWarehouseList from "../hooks/useWarehouseList";
import WarehouseForm from "./WarehouseForm";
import { useMutation } from "@apollo/client";
import {
  DELETE_WAREHOUSE,
  UPDATE_WAREHOUSE,
} from "../../../graphql/mutations/Warehouse";
import { LIST_WAREHOUSE } from "../../../graphql/queries/Warehouse";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { ColumnEditorOptions } from "primereact/column";
import { textEditor } from "../../../components/textEditor/textEditor";
import WarehouseDetail from "./WarehouseDetail";

const WarehouseList = () => {
  const { listWarehouse, loadingListWarehouse } = useWarehouseList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<IWarehouse>();

  const [deleteWarehouse] = useMutation(DELETE_WAREHOUSE, {
    refetchQueries: [
      {
        query: LIST_WAREHOUSE,
      },
    ],
  });

  const [updateWarehouse] = useMutation(UPDATE_WAREHOUSE, {
    refetchQueries: [
      {
        query: LIST_WAREHOUSE,
      },
    ],
  });

  const getStatus = (rowData: IWarehouse): Status | null => {
    switch (rowData.is_active) {
      case false:
        return {
          severity: "danger",
          label: "Inactivo",
        };

      case true:
        return {
          severity: "success",
          label: "Activo",
        };
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData: IWarehouse) => {
    const status = getStatus(rowData);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag
          value={rowData.is_active}
          severity={severity as "danger" | "success"}
        >
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
      const { data } = await deleteWarehouse({
        variables: {
          warehouseId,
        },
      });

      if (data.deleteWarehouse.success) {
        showToast({
          detail: "Almacén eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
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

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IWarehouse[]>
  ) => {
    setCurrentWarehouse(e.value);
    setVisibleDetail(true);
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      if (e.newData.name === "") {
        showToast({
          detail: "El nombre es obligatorio",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateWarehouse({
          variables: {
            warehouseId: e.newData._id,
            name: e.newData.name,
            description: e.newData.description,
          },
        });

        if (data) {
          showToast({
            detail: "Almacén actualizado.",
            severity: ToastSeverity.Success,
          });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
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
  return (
    <div className="size-full">
      {tableHeaderTemplate()}
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
      <Dialog
        header="Nuevo Almacén"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <WarehouseForm setVisibleForm={setVisibleForm} />
      </Dialog>
      <Dialog
        className="md:w-[90vw] w-[90vw]"
        visible={visibleDetail}
        header={currentWarehouse && `Detalle de marca`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentWarehouse && <WarehouseDetail warehouse={currentWarehouse} />}
      </Dialog>
    </div>
  );
};

export default WarehouseList;
