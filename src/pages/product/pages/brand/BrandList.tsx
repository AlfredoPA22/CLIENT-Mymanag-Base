import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { textEditor } from "../../../../components/textEditor/textEditor";
import {
  DELETE_BRAND,
  UPDATE_BRAND,
} from "../../../../graphql/mutations/Brand";
import { LIST_BRAND } from "../../../../graphql/queries/Brand";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IBrand } from "../../../../utils/interfaces/Brand";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import { Status } from "../../../../utils/types/StatusType";
import useBrandList from "../../hooks/useBrandList";
import BrandForm from "./BrandForm";
import BrandDetail from "./BrandDetail";
import { Card } from "primereact/card";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";
import { useDispatch } from "react-redux";

const BrandList = () => {
  const { listBrand, loadingListBrand } = useBrandList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentBrand, setCurrentBrand] = useState<IBrand>();

  const dispatch = useDispatch();

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
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de marcas (${listBrand.length})`}</h1>
        <Button
          id="btn-new-brand"
          icon="pi pi-plus"
          severity="success"
          tooltip="Nueva marca"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IBrand) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="eliminar marca"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteBrand(rowData._id)}
        />
      </div>
    );
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IBrand[]>
  ) => {
    setCurrentBrand(e.value);
    setVisibleDetail(true);
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
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

  if (loadingListBrand) {
    return <LoadingSpinner />;
  }
  return (
    <Card id="brand-list-table" className="py-2" header={tableHeaderTemplate}>
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
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        header="Nueva Marca"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <BrandForm setVisibleForm={setVisibleForm} />
      </Dialog>
      <Dialog
        className="md:w-[90vw] w-[95vw]"
        visible={visibleDetail}
        header={currentBrand && `Detalle de marca`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentBrand && <BrandDetail brand={currentBrand} />}
      </Dialog>
    </Card>
  );
};

export default BrandList;
