import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { ColumnEditorOptions } from "primereact/column";
import { DataTableRowEditCompleteEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { useState } from "react";
import { useDispatch } from "react-redux";
import Table from "../../../components/datatable/Table";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import { textEditor } from "../../../components/textEditor/textEditor";
import {
  DELETE_PROVIDER,
  UPDATE_PROVIDER,
} from "../../../graphql/mutations/Provider";
import { LIST_PROVIDER } from "../../../graphql/queries/Provider";
import useTableGlobalFilter from "../../../hooks/useTableGlobalFilter";
import { setIsBlocked } from "../../../redux/slices/blockUISlice";
import { ToastSeverity } from "../../../utils/enums/toast.enum";
import { IProvider } from "../../../utils/interfaces/Provider";
import { DataTableColumn } from "../../../utils/interfaces/Table";
import { showToast } from "../../../utils/toastUtils";
import useProviderList from "../hooks/useProviderList";
import ProviderForm from "./ProviderForm";

const ProviderList = () => {
  const { listProvider, loadingListProvider } = useProviderList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [mobileEditVisible, setMobileEditVisible] = useState(false);
  const [mobileEditData, setMobileEditData] = useState<IProvider | null>(null);

  const dispatch = useDispatch();

  const [deleteProvider] = useMutation(DELETE_PROVIDER, {
    refetchQueries: [{ query: LIST_PROVIDER }],
  });

  const [updateProvider] = useMutation(UPDATE_PROVIDER, {
    refetchQueries: [{ query: LIST_PROVIDER }],
  });

  const tableHeaderTemplate = () => (
    <div className="flex justify-between items-center m-2 px-5">
      <h1 className="text-2xl font-bold">{`Lista de proveedores (${listProvider.length})`}</h1>
      <Button
        id="btn-new-provider"
        icon="pi pi-plus"
        severity="success"
        tooltip="Nuevo proveedor"
        tooltipOptions={{ position: "left" }}
        onClick={() => setVisibleForm(true)}
        raised
      />
    </div>
  );

  const handleDeleteProvider = async (providerId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteProvider({ variables: { providerId } });
      if (data.deleteProvider.success) {
        showToast({ detail: "Proveedor eliminado.", severity: ToastSeverity.Success });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IProvider) => (
    <div className="flex justify-center gap-2">
      <Button
        tooltip="Eliminar proveedor"
        tooltipOptions={{ position: "left" }}
        icon="pi pi-trash"
        raised
        severity="danger"
        onClick={() => handleDeleteProvider(rowData._id)}
      />
    </div>
  );

  const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
    try {
      dispatch(setIsBlocked(true));
      if (e.newData.name === "") {
        showToast({ detail: "El nombre es obligatorio", severity: ToastSeverity.Error });
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
          showToast({ detail: "Proveedor actualizado.", severity: ToastSeverity.Success });
        }
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleMobileEdit = (item: IProvider) => {
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
      await updateProvider({
        variables: {
          providerId: mobileEditData._id,
          name: mobileEditData.name,
          address: mobileEditData.address,
          phoneNumber: mobileEditData.phoneNumber,
        },
      });
      showToast({ detail: "Proveedor actualizado.", severity: ToastSeverity.Success });
      setMobileEditVisible(false);
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const [columns] = useState<DataTableColumn<IProvider>[]>([
    { field: "code", header: "Codigo", sortable: true, style: { width: "15%" } },
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

  if (loadingListProvider) return <LoadingSpinner />;

  const dialogs = (
    <>
      <Dialog
        header="Nuevo Proveedor"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
        className="w-[95vw] md:w-auto"
      >
        <ProviderForm setVisibleForm={setVisibleForm} />
      </Dialog>

      <Dialog
        header="Editar Proveedor"
        visible={mobileEditVisible}
        onHide={() => setMobileEditVisible(false)}
        className="w-[95vw]"
      >
        {mobileEditData && (
          <div className="flex flex-col gap-3 pt-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Nombre <span className="text-red-500">*</span></label>
              <InputText
                value={mobileEditData.name}
                onChange={(e) => setMobileEditData({ ...mobileEditData, name: e.target.value })}
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
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500">Teléfono</label>
              <InputText
                value={mobileEditData.phoneNumber ?? ""}
                onChange={(e) => setMobileEditData({ ...mobileEditData, phoneNumber: e.target.value })}
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
          <h1 className="text-lg font-bold">{`Proveedores (${listProvider.length})`}</h1>
          <Button
            label="Nuevo"
            icon="pi pi-plus"
            severity="success"
            size="small"
            onClick={() => setVisibleForm(true)}
            raised
          />
        </div>

        {listProvider.length === 0 && (
          <p className="text-center text-gray-400 py-6 text-sm">Sin proveedores.</p>
        )}

        {listProvider.map((item: IProvider) => (
          <div
            key={item._id}
            className="border border-gray-200 rounded-xl p-3 bg-white shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 overflow-hidden flex-1">
                <p className="text-xs text-gray-400">{item.code}</p>
                <p className="font-bold text-gray-800 text-sm break-words">{item.name}</p>
              </div>
            </div>

            {(item.address || item.phoneNumber) && (
              <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                {item.address && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-map-marker text-[10px]" />
                    <span className="break-words">{item.address}</span>
                  </span>
                )}
                {item.phoneNumber && (
                  <span className="flex items-center gap-1">
                    <i className="pi pi-phone text-[10px]" />
                    {item.phoneNumber}
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
                onClick={() => handleMobileEdit(item)}
              />
              <Button
                icon="pi pi-trash"
                size="small"
                severity="danger"
                raised
                onClick={() => handleDeleteProvider(item._id)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* ── Desktop ─────────────────────────────────────────── */}
      <Card id="provider-list-table" className="py-2 hidden md:block" header={tableHeaderTemplate}>
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
      </Card>

      {dialogs}
    </>
  );
};

export default ProviderList;
