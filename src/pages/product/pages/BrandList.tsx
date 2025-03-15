import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import { textEditor } from "../../../components/textEditor/textEditor";
import { DELETE_BRAND, UPDATE_BRAND } from "../../../graphql/mutations/Brand";
import { LIST_BRAND } from "../../../graphql/queries/Brand";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IBrand } from "../../../utils/interfaces/Brand";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import { Status } from "../../../utils/types/StatusType";
import useBrandList from "../hooks/useBrandList";
import BrandForm from "./BrandForm";

const BrandList = () => {
  const { listBrand, loadingListBrand } = useBrandList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);

  const [deleteBrand] = useMutation(DELETE_BRAND, {
    refetchQueries: [
      {
        query: LIST_BRAND,
      },
    ],
  });

  const [updateBrand] = useMutation(UPDATE_BRAND, {
    refetchQueries: [
      {
        query: LIST_BRAND,
      },
    ],
  });

  const getStatus = (rowData: IBrand): Status | null => {
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

  const statusBodyTemplate = (rowData: IBrand) => {
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
      <div className="flex justify-end">
        <Button
          label="Crear Marca"
          severity="success"
          onClick={() => setVisibleForm(true)}
          rounded
        />
      </div>
    );
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const { data } = await deleteBrand({
        variables: {
          brandId,
        },
      });

      if (data.deleteBrand.success) {
        showToast({
          detail: "Marca eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IBrand) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="eliminar marca"
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteBrand(rowData._id)}
        />
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      if (e.newData.name === "") {
        showToast({
          detail: "El nombre es obligatorio",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateBrand({
          variables: {
            brandId: e.newData._id,
            name: e.newData.name,
            description: e.newData.description,
          },
        });

        if (data) {
          showToast({
            detail: "Marca actualizada.",
            severity: ToastSeverity.Success,
          });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const [columns] = useState<DataTableColumn<IBrand>[]>([
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
      field: "count_product",
      header: "Productos con esta marca",
      sortable: true,
      style: { width: "15%", textAlign: "center" },
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

  return (
    <Card
      className="size-full"
      title="Lista de Marcas"
      subTitle={tableHeaderTemplate}
    >
      {loadingListBrand ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listBrand}
            emptyMessage="Sin marcas."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
            onRowEditComplete={onRowEditComplete}
          />
          <Dialog
            header="Nueva Marca"
            visible={visibleForm}
            onHide={() => setVisibleForm(false)}
          >
            <BrandForm setVisibleForm={setVisibleForm} />
          </Dialog>
        </div>
      )}
    </Card>
  );
};

export default BrandList;
