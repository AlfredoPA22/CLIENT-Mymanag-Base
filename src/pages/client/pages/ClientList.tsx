import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { textEditor } from "../../../components/textEditor/textEditor";
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
import ClientDetail from "./ClientDetail";
import ClientForm from "./ClientForm";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../redux/slices/blockUISlice";

const ClientList = () => {
  const { listClient, loadingListClient } = useClientList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentClient, setCurrentClient] = useState<IClient>();

  const dispatch = useDispatch();

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
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de clientes (${listClient.length})`}</h1>

        <Button
          id="btn-new-client"
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo cliente"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleDeleteClient = async (clientId: string) => {
    try {
      dispatch(setIsBlocked(true));
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IClient) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Eliminar cliente"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteClient(rowData._id)}
        />
      </div>
    );
  };

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.fullName === "") {
        showToast({
          detail: "El nombre es obligatorio",
          severity: ToastSeverity.Error,
        });
      } else {
        const { data } = await updateClient({
          variables: {
            clientId: e.newData._id,
            fullName: e.newData.fullName,
            email: e.newData.email,
            address: e.newData.address,
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
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IClient[]>
  ) => {
    setCurrentClient(e.value);
    setVisibleDetail(true);
  };

  const [columns] = useState<DataTableColumn<IClient>[]>([
    {
      field: "code",
      header: "Codigo",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "fullName",
      header: "Nombre",
      sortable: true,
      style: { width: "20%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "phoneNumber",
      header: "Telefono",
      sortable: true,
      style: { width: "15%", textAlign: "center" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "email",
      header: "Correo",
      style: { width: "10%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
    {
      field: "address",
      header: "Direccion",
      style: { width: "40%" },
      fieldEditor: (options: ColumnEditorOptions) => textEditor(options),
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListClient) {
    return <LoadingSpinner />;
  }

  return (
    <Card id="client-list-table" className="py-2" header={tableHeaderTemplate}>
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
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        header="Nuevo Cliente"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <ClientForm setVisibleForm={setVisibleForm} />
      </Dialog>

      <Dialog
        className="md:w-[90vw] w-[95vw]"
        visible={visibleDetail}
        header={currentClient && `Detalle de cliente`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentClient && <ClientDetail client={currentClient} />}
      </Dialog>
    </Card>
  );
};

export default ClientList;
