import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import {
  DELETE_CLIENT,
  UPDATE_CLIENT,
} from "../../../graphql/mutations/Client";
import { LIST_CLIENT } from "../../../graphql/queries/Client";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IClient } from "../../../utils/interfaces/Client";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import useClientList from "../hooks/useClientList";
import ClientForm from "./ClientForm";
import ClientSaleOrderList from "./ClientSaleOrderList";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { ColumnEditorOptions } from "primereact/column";
import { textEditor } from "../../../components/textEditor/textEditor";

const ClientList = () => {
  const { listClient, loadingListClient } = useClientList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleList, setVisibleList] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<IClient>();

  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [
      {
        query: LIST_CLIENT,
      },
    ],
  });

  const [updateClient] = useMutation(UPDATE_CLIENT, {
    refetchQueries: [
      {
        query: LIST_CLIENT,
      },
    ],
  });

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-end">
        <Button
          label="Crear Cliente"
          severity="success"
          onClick={() => setVisibleForm(true)}
          rounded
        />
      </div>
    );
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      const { data } = await deleteClient({
        variables: {
          clientId,
        },
      });

      if (data.deleteClient.success) {
        showToast({
          detail: "Cliente eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IClient) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Eliminar cliente"
          icon="pi pi-times"
          rounded
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteClient(rowData._id)}
        />
        <Button
          tooltip="Ver ventas"
          icon="pi pi-list"
          rounded
          severity="info"
          aria-label="Cancel"
          onClick={() => {
            setCurrentClient(rowData);
            setVisibleList(true);
          }}
        />
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      if (e.newData.firstName === "" || e.newData.lastName === "") {
        showToast({
          detail: "El nombre y el apellido son obligatorios",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateClient({
          variables: {
            clientId: e.newData._id,
            firstName: e.newData.firstName,
            lastName: e.newData.lastName,
            phoneNumber: e.newData.phoneNumber,
          },
        });

        if (data) {
          showToast({
            detail: "Cliente actualizado.",
            severity: ToastSeverity.Success,
          });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const [columns] = useState<DataTableColumn<IClient>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "firstName",
      header: "Nombre",
      sortable: true,
      style: { width: "30%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),

    },
    {
      field: "lastName",
      header: "Apellidos",
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
      title="Lista de Clientes"
      subTitle={tableHeaderTemplate}
    >
      {loadingListClient ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listClient}
            emptyMessage="Sin clientes."
            size="small"
            actionBodyTemplate={actionBodyTemplate}
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
            onRowEditComplete={onRowEditComplete}
          />
          <Dialog
            header="Nuevo Cliente"
            visible={visibleForm}
            onHide={() => setVisibleForm(false)}
          >
            <ClientForm setVisibleForm={setVisibleForm} />
          </Dialog>

          <Dialog
            className="md:w-[50vw] w-[90vw]"
            visible={visibleList}
            onHide={() => setVisibleList(false)}
          >
            {currentClient && <ClientSaleOrderList client={currentClient} />}
          </Dialog>
        </div>
      )}
    </Card>
  );
};

export default ClientList;
