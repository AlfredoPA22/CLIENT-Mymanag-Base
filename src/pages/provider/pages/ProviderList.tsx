import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { textEditor } from "../../../components/textEditor/textEditor";
import {
  DELETE_PROVIDER,
  UPDATE_PROVIDER,
} from "../../../graphql/mutations/Provider";
import { LIST_PROVIDER } from "../../../graphql/queries/Provider";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProvider } from "../../../utils/interfaces/Provider";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import useProviderList from "../hooks/useProviderList";
import ProviderForm from "./ProviderForm";
import { Card } from "primereact/card";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../redux/slices/blockUISlice";

const ProviderList = () => {
  const { listProvider, loadingListProvider } = useProviderList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);

  const dispatch = useDispatch();

  const [deleteProvider] = useMutation(DELETE_PROVIDER, {
    refetchQueries: [
      {
        query: LIST_PROVIDER,
      },
    ],
  });

  const [updateProvider] = useMutation(UPDATE_PROVIDER, {
    refetchQueries: [
      {
        query: LIST_PROVIDER,
      },
    ],
  });

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de proveedores (${listProvider.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo proveedor"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProvider({
        variables: {
          providerId,
        },
      });

      if (data.deleteProvider.success) {
        showToast({
          detail: "Proveedor eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IProvider) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Eliminar proveedor"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteProvider(rowData._id)}
        />
      </div>
    );
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
        const { data } = await updateProvider({
          variables: {
            providerId: e.newData._id,
            name: e.newData.name,
            address: e.newData.address,
            phoneNumber: e.newData.phoneNumber,
          },
        });

        if (data) {
          showToast({
            detail: "Proveedor actualizado.",
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

  const [columns] = useState<DataTableColumn<IProvider>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "30%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "address",
      header: "Direccion",
      style: { width: "30%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "phoneNumber",
      header: "Telefono",
      sortable: true,
      style: { width: "15%", textAlign: "center" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListProvider) {
    return <LoadingSpinner />;
  }

  return (
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listProvider}
        emptyMessage="Sin proveedores."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
        onRowEditComplete={onRowEditComplete}
      />
      <Dialog
        header="Nuevo Proveedor"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <ProviderForm setVisibleForm={setVisibleForm} />
      </Dialog>
    </Card>
  );
};

export default ProviderList;
