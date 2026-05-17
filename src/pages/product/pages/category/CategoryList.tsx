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
  DELETE_CATEGORY,
  UPDATE_CATEGORY,
} from "../../../../graphql/mutations/Category";
import { LIST_CATEGORY } from "../../../../graphql/queries/Category";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { ICategory } from "../../../../utils/interfaces/Category";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { Status } from "../../../../utils/types/StatusType";
import useCategoryList from "../../hooks/useCategoryList";
import CategoryDetail from "./CategoryDetail";
import CategoryForm from "./CategoryForm";
import { Card } from "primereact/card";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

const CategoryList = () => {
  const { listCategory, loadingListCategory } = useCategoryList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentCategory, setCurrentCategory] = useState<ICategory>();
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<ICategory | null>(null);

  const dispatch = useDispatch();

  const [deleteCategory] = useMutation(DELETE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORY }],
  });

  const [updateCategory] = useMutation(UPDATE_CATEGORY, {
    refetchQueries: [{ query: LIST_CATEGORY }],
  });

  const getStatus = (rowData: ICategory): Status | null => {
    switch (rowData.is_active) {
      case false:
        return { severity: "danger", label: "Inactivo" };
      case true:
        return { severity: "success", label: "Activo" };
      default:
        return null;
    }
  };

  const statusBodyTemplate = (rowData: ICategory) => {
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
        <h1 className="text-2xl font-bold">{`Lista de categorias (${listCategory.length})`}</h1>
        <Button
          id="btn-new-category"
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
      dispatch(setIsBlocked(true));
      const { data } = await deleteCategory({ variables: { categoryId } });
      if (data.deleteCategory.success) {
        showToast({ detail: "Categoria eliminada.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
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
      dispatch(setIsBlocked(true));
      if (e.newData.name === "") {
        showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
      } else {
        const { data } = await updateCategory({
          variables: {
            categoryId: e.newData._id,
            name: e.newData.name,
            description: e.newData.description,
          },
        });
        if (data) {
          showToast({ detail: "Categoria actualizada.", severity: ToastSeverity.Success });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleSelectionChange = (e: DataTableSelectionSingleChangeEvent<ICategory[]>) => {
    setCurrentCategory(e.value);
    setVisibleDetail(true);
  };

  const handleMobileEdit = (item: ICategory) => {
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
      await updateCategory({
        variables: {
          categoryId: mobileEditData._id,
          name: mobileEditData.name,
          description: mobileEditData.description,
        },
      });
      showToast({ detail: "Categoria actualizada.", severity: ToastSeverity.Success });
      setMobileEditVisible(false);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
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

  const dialogs = (
    <>
      <Dialog
        header="Nueva Categoria"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <CategoryForm setVisibleForm={setVisibleForm} />
      </Dialog>
      <Dialog
        className="md:w-[90vw] w-[95vw]"
        visible={visibleDetail}
        header={currentCategory && `Detalle de categoria`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentCategory && <CategoryDetail category={currentCategory} />}
      </Dialog>
      <Dialog
        header="Editar Categoria"
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
          <h1 className="text-lg font-bold">{`Categorias (${listCategory.length})`}</h1>
          <Button
            label="Nueva"
            icon="pi pi-plus"
            severity="success"
            size="small"
            onClick={() => setVisibleForm(true)}
            raised
          />
        </div>

        {(!listCategory || listCategory.length === 0) && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin categorias.</p>
        )}

        {listCategory.map((item: ICategory) => {
          const status = getStatus(item);
          return (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer active:bg-gray-50"
              onClick={() => { setCurrentCategory(item); setVisibleDetail(true); }}
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
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {item.count_product} producto{item.count_product !== 1 ? "s" : ""}
                </span>
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
                    onClick={() => handleDeleteCategory(item._id)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="category-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
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
          onSelectionChange={handleSelectionChange}
        />
      </Card>

      {dialogs}
    </>
  );
};

export default CategoryList;
