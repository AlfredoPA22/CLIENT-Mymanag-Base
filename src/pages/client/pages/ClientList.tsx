import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import {
  DataTableRowEditCompleteEvent,
  DataTableSelectionSingleChangeEvent,
} from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
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
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<IClient | null>(null);

  const dispatch = useDispatch();

  const [deleteClient] = useMutation(DELETE_CLIENT, {
    refetchQueries: [{ query: LIST_CLIENT }],
  });

  const [updateClient] = useMutation(UPDATE_CLIENT, {
    refetchQueries: [{ query: LIST_CLIENT }],
  });

  const tableHeaderTemplate = () => (
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

  const handleDeleteClient = async (clientId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteClient({ variables: { clientId } });
      if (data.deleteClient.success) {
        showToast({ detail: "Cliente eliminado.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IClient) => (
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

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.fullName === "") {
        showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
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
          showToast({ detail: "Cliente actualizado.", severity: ToastSeverity.Success });
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

  const handleMobileEdit = (item: IClient) => {
    setMobileEditData({ ...item });
    setMobileEditVisible(true);
  };

  const handleMobileEditSave = async () => {
    if (!mobileEditData) return;
    if (!mobileEditData.fullName.trim()) {
      showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
      return;
    }
    try {
      dispatch(setIsBlocked(true));
      await updateClient({
        variables: {
          clientId: mobileEditData._id,
          fullName: mobileEditData.fullName,
          email: mobileEditData.email,
          address: mobileEditData.address,
          phoneNumber: mobileEditData.phoneNumber,
        },
      });
      showToast({ detail: "Cliente actualizado.", severity: ToastSeverity.Success });
      setMobileEditVisible(false);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<IClient>[]>([
    { field: "code", header: "Codigo", sortable: true, style: { width: "15%" } },
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

  if (loadingListClient) return <LoadingSpinner />;

  const dialogs = (
    <>
      <Dialog
        header="Nuevo Cliente"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
        className="w-[95vw] md:w-auto"
      >
        <ClientForm setVisibleForm={setVisibleForm} />
      </Dialog>

      <Dialog
        className="w-[95vw] md:w-[90vw]"
        visible={visibleDetail}
        header={currentClient && `Detalle de cliente`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentClient && <ClientDetail client={currentClient} />}
      </Dialog>

      <Dialog
        header="Editar Cliente"
        visible={mobileEditVisible}
        onHide={() => setMobileEditVisible(false)}
        className="w-[95vw]"
      >
        {mobileEditData && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Nombre completo <span className="text-red-500">*</span></label>
              <InputText
                value={mobileEditData.fullName}
                onChange={(e) => setMobileEditData({ ...mobileEditData, fullName: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Teléfono</label>
              <InputText
                value={mobileEditData.phoneNumber ?? ""}
                onChange={(e) => setMobileEditData({ ...mobileEditData, phoneNumber: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Correo</label>
              <InputText
                value={mobileEditData.email ?? ""}
                onChange={(e) => setMobileEditData({ ...mobileEditData, email: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Dirección</label>
              <InputText
                value={mobileEditData.address ?? ""}
                onChange={(e) => setMobileEditData({ ...mobileEditData, address: e.target.value })}
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
          <h1 className="text-lg font-bold">{`Clientes (${listClient.length})`}</h1>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            severity="success"
            size="small"
            onClick={() => setVisibleForm(true)}
            raised
          />
        </div>

        {listClient.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin clientes.</p>
        )}

        {listClient.map((item: IClient) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm cursor-pointer"
            onClick={() => { setCurrentClient(item); setVisibleDetail(true); }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 overflow-hidden flex-1">
                <p className="text-xs text-gray-400">{item.code}</p>
                <p className="font-bold text-gray-800 text-sm break-words">{item.fullName}</p>
              </div>
            </div>

            {(item.phoneNumber || item.email || item.address) && (
              <div className="mt-1.5 flex flex-col gap-0.5 text-xs text-gray-500">
                {item.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-phone text-[10px]" />
                    {item.phoneNumber}
                  </span>
                )}
                {item.email && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-envelope text-[10px]" />
                    <span className="break-all">{item.email}</span>
                  </span>
                )}
                {item.address && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-map-marker text-[10px]" />
                    <span className="break-words">{item.address}</span>
                  </span>
                )}
              </div>
            )}

            <div className="flex gap-2 mt-2 justify-end">
              <Button
                icon="pi pi-pencil"
                size="small"
                severity="secondary"
                raised
                onClick={(e) => { e.stopPropagation(); handleMobileEdit(item); }}
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                raised
                onClick={(e) => { e.stopPropagation(); handleDeleteClient(item._id); }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="client-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
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
      </Card>

      {dialogs}
    </>
  );
};

export default ClientList;
