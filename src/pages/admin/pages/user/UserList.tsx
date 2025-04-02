import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { IUser } from "../../../../utils/interfaces/User";
import { Status } from "../../../../utils/types/StatusType";
import useUserList from "../../hooks/useUserList";
import UserForm from "./FormUser";

const UserList = () => {
  const { listUser, loadingListUser } = useUserList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);

  const getStatus = (rowData: IUser): Status | null => {
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

  const statusBodyTemplate = (rowData: IUser) => {
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
        <h1 className="text-2xl font-bold">Lista de usuarios</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo usuario"
          tooltipOptions={{ position: "left" }}
          onClick={() => setVisibleForm(true)}
          raised
        />
      </div>
    );
  };

  const [columns] = useState<DataTableColumn<IUser>[]>([
    {
      field: "user_name",
      header: "Usuario",
      sortable: true,
      style: { width: "15%" },
    },
    {
      field: "role.name",
      header: "Rol",
      sortable: true,
      style: { width: "30%" },
    },
    {
      field: "role.description",
      header: "Descripcion",
      style: { width: "30%" },
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

  return (
    <Card className="size-full" header={tableHeaderTemplate}>
      {loadingListUser ? (
        "cargando..."
      ) : (
        <div>
          <Table
            columns={columns}
            data={listUser}
            emptyMessage="Sin usuarios."
            size="small"
            dataFilters={filters}
            tableHeader={renderFilterInput}
            editMode="row"
          />
          <Dialog
            header="Nuevo Usuario"
            visible={visibleForm}
            onHide={() => setVisibleForm(false)}
          >
            <UserForm setVisibleForm={setVisibleForm} />
          </Dialog>
        </div>
      )}
    </Card>
  );
};

export default UserList;
