import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import { ICategory } from "../../../utils/interfaces/Category";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { Status } from "../../../utils/types/StatusType";
import useCategoryList from "../hooks/useCategoryList";
import CategoryForm from "./CategoryForm";
import { useMutation } from "@apollo/client";
import {
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
} from "../../../graphql/mutations/Category";
import { LIST_CATEGORY } from "../../../graphql/queries/Category";
import { showToast } from "../../../utils/toastUtils";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ColumnEditorOptions } from "primereact/column";
import { textEditor } from "../../../components/textEditor/textEditor";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const CategoryList = () => {
  const { listCategory, loadingListCategory } = useCategoryList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [
      {
        query: LIST_CATEGORY,
      },
    ],
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [
      {
        query: LIST_CATEGORY,
      },
    ],
  });

  const getStatus = (rowData: ICategory): Status | null => {
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

  const statusBodyTemplate = (rowData: ICategory) => {
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
        <h1 className="text-2xl font-bold">{`Lista de categorias (${listCategory.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva categoria"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      const { data } = await deleteCategory({
        variables: {
          categoryId,
        },
      });

      if (data.deleteCategory.success) {
        showToast({
          detail: "Categoria eliminada.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: ICategory) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="eliminar categoria"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteCategory(rowData._id)}
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
        const { data } = await updateCategory({
          variables: {
            categoryId: e.newData._id,
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

  const [columns] = useState<DataTableColumn<ICategory>[]>([
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
      header: "Productos con esta categoria",
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

  if (loadingListCategory) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="size-full" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listCategory}
        emptyMessage="Sin categorias."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
      />
      <Dialog
        header="Nueva Categoria"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <CategoryForm setVisibleForm={setVisibleForm} />
      </Dialog>
    </Card>
  );
};

export default CategoryList;
