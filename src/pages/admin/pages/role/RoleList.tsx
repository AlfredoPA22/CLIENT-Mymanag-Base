import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import { DELETE_ROLE } from "../../../../graphql/mutations/Role";
import { LIST_ROLE } from "../../../../graphql/queries/Role";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { IRole } from "../../../../utils/interfaces/Role";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { showToast } from "../../../../utils/toastUtils";
import useRoleList from "../../hooks/useRoleList";
import RoleDetail from "./RoleDetail";
import RoleForm from "./RoleForm";
import RolePermissionsForm from "./RolePermissionsForm";
import { Card } from "primereact/card";

const RoleList = () => {
  const { listRole, loadingListRole } = useRoleList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [visiblePermissions, setVisiblePermissions] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<IRole>();
  const [permissionsRole, setPermissionsRole] = useState<IRole>();

  const [deleteRole] = useMutation(DELETE_ROLE, {
    refetchQueries: [
      {
        query: LIST_ROLE,
      },
    ],
  });
  
  const tableHeaderTemplate = () => {
    return (
      <div className="flex justify-between items-center m-2 px-5">
        <h1 className="text-2xl font-bold">{`Lista de roles (${listRole.length})`}</h1>

        <Button
          id="btn-new-role"
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

  const handleDeleteRole = async (roleId: string) => {
    try {
      const { data } = await deleteRole({
        variables: {
          roleId,
        },
      });

      if (data.deleteRole.success) {
        showToast({
          detail: "Rol eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    }
  };

  const actionBodyTemplate = (rowData: IRole) => {
    return (
      <div className="flex justify-center gap-2">
        <Button
          tooltip="Editar permisos"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-lock"
          raised
          severity="info"
          onClick={() => {
            setPermissionsRole(rowData);
            setVisiblePermissions(true);
          }}
        />
        <Button
          tooltip="Eliminar rol"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteRole(rowData._id)}
        />
      </div>
    );
  };

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
    <Card id="roles-list-table" className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listRole}
        emptyMessage="Sin roles."
        size="small"
        actionBodyTemplate={actionBodyTemplate}
        dataFilters={filters}
        tableHeader={renderFilterInput}
        editMode="row"
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

      <Dialog
        className="w-[95vw] md:w-[700px]"
        visible={visiblePermissions}
        header={permissionsRole ? `Permisos — ${permissionsRole.name}` : "Permisos"}
        onHide={() => setVisiblePermissions(false)}
      >
        {permissionsRole && (
          <RolePermissionsForm
            role={permissionsRole}
            onClose={() => setVisiblePermissions(false)}
          />
        )}
      </Dialog>
    </Card>
  );
};

export default RoleList;
