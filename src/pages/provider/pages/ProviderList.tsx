import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
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

const ProviderList = () => {
  const { listProvider, loadingListProvider } = useProviderList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);

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
      <div className="flex justify-end">
        <Button
          label="Crear Proveedor"
          severity="success"
          onClick={() => setVisibleForm(true)}
          rounded
        />
      </div>
    );
  };

  const handleDeleteProvider = async (providerId: string) => {
    try {
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
    }
  };

  const actionBodyTemplate = (rowData: IProvider) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Eliminar proveedor"
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteProvider(rowData._id)}
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

  return (
    <Card
      className="size-full"
      title="Lista de Proveedores"
      subTitle={tableHeaderTemplate}
    >
      {loadingListProvider ? (
        "cargando..."
      ) : (
        <div>
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

          {/* <Dialog
            className="md:w-[50vw] w-[90vw]"
            visible={visibleList}
            onHide={() => setVisibleList(false)}
          >
            {currentProvider && <ClientSaleOrderList client={currentProvider} />}
          </Dialog> */}
        </div>
      )}
    </Card>
  );
};

export default ProviderList;
