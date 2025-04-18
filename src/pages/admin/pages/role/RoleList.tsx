import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { IRole } from "../../../../utils/interfaces/Role";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import useRoleList from "../../hooks/useRoleList";
import RoleForm from "./RoleForm";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import RoleDetail from "./RoleDetail";

const RoleList = () => {
  const { listRole, loadingListRole } = useRoleList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<IRole>();

  //   const [deleteClient] = useMutation(DELETE_CLIENT, {
  //     refetchQueries: [
  //       {
  //         query: LIST_CLIENT,
  //       },
  //     ],
  //   });

  //   const [updateClient] = useMutation(UPDATE_CLIENT, {
  //     refetchQueries: [
  //       {
  //         query: LIST_CLIENT,
  //       },
  //     ],
  //   });
  // const getStatus = (rowData: IUser): Status | null => {
  //   switch (rowData.is_active) {
  //     case false:
  //       return {
  //         severity: "danger",
  //         label: "Inactivo",
  //       };

  //     case true:
  //       return {
  //         severity: "success",
  //         label: "Activo",
  //       };
  //     default:
  //       return null;
  //   }
  // };

  // const statusBodyTemplate = (rowData: IUser) => {
  //   const status = getStatus(rowData);
  //   if (status) {
  //     const { severity, label } = status;
  //     return (
  //       <Tag
  //         value={rowData.is_active}
  //         severity={severity as "danger" | "success"}
  //       >
  //         {label}
  //       </Tag>
  //     );
  //   }
  //   return null;
  // };

  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de roles (${listRole.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo rol"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IRole[]>
  ) => {
    setCurrentRole(e.value);
    setVisibleDetail(true);
  };

  //   const handleDeleteClient = async (clientId: string) => {
  //     try {
  //       const { data } = await deleteClient({
  //         variables: {
  //           clientId,
  //         },
  //       });

  //       if (data.deleteClient.success) {
  //         showToast({
  //           detail: "Cliente eliminado.",
  //           severity: ToastSeverity.Success,
  //         });
  //       }
  //     } catch (error: any) {
  //       showToast({ detail: error.message, severity: ToastSeverity.Error });
  //     }
  //   };

  //   const actionBodyTemplate = (rowData: IClient) => {
  //     return (
  //       <div className="flex justify-center gap-2">
  //         <Button
  //           tooltip="Eliminar cliente"
  //           tooltipOptions={{ position: "left" }}
  //           icon="pi pi-trash"
  //           raised
  //           severity="danger"
  //           aria-label="Cancel"
  //           onClick={() => handleDeleteClient(rowData._id)}
  //         />
  //         <Button
  //           tooltip="Ver ventas"
  //           tooltipOptions={{ position: "left" }}
  //           icon="pi pi-list"
  //           raised
  //           severity="info"
  //           aria-label="Cancel"
  //           onClick={() => {
  //             setCurrentClient(rowData);
  //             setVisibleList(true);
  //           }}
  //         />
  //       </div>
  //     );
  //   };

  //   const onRowEditComplete = async (e: DataTableRowEditCompleteEvent) => {
  //     try {
  //       if (e.newData.firstName === "" || e.newData.lastName === "") {
  //         showToast({
  //           detail: "El nombre y el apellido son obligatorios",
  //           severity: ToastSeverity.Error,
  //         });
  //       } else {
  //         const { data } = await updateClient({
  //           variables: {
  //             clientId: e.newData._id,
  //             firstName: e.newData.firstName,
  //             lastName: e.newData.lastName,
  //             phoneNumber: e.newData.phoneNumber,
  //           },
  //         });

  //         if (data) {
  //           showToast({
  //             detail: "Cliente actualizado.",
  //             severity: ToastSeverity.Success,
  //           });
  //         }
  //       }
  //     } catch (error: any) {
  //       showToast({ detail: error.message, severity: ToastSeverity.Error });
  //     }
  //   };

  const [columns] = useState<DataTableColumn<IRole>[]>([
    {
      field: "name",
      header: "Nombre",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "description",
      header: "Descripcion",
      sortable: true,
      style: { width: "30%" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListRole) {
    return <LoadingSpinner />;
  }

  return (
    <div className="size-full">
      {tableHeaderTemplate()}
      <Table
        columns={columns}
        data={listRole}
        emptyMessage="Sin roles."
        size="small"
        // actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
        // onRowEditComplete={onRowEditComplete}
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        header="Nuevo Rol"
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <RoleForm setVisibleForm={setVisibleForm} />
      </Dialog>

      <Dialog
        className="md:w-[90vw] w-[90vw]"
        visible={visibleDetail}
        header={currentRole && `Detalle de rol`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentRole && <RoleDetail role={currentRole} />}
      </Dialog>
    </div>
  );
};

export default RoleList;
