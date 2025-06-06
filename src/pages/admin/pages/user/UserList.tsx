import { useMutation } from "@apollo/client";
import { Button } from "primereact/button";
import { DataTableSelectionSingleChangeEvent } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { InputSwitch } from "primereact/inputswitch";
import { Tag } from "primereact/tag";
import { useState } from "react";
import Table from "../../../../components/datatable/Table";
import LoadingSpinner from "../../../../components/LoadingSpinner/LoadingSpinner";
import {
  CHANGE_USER_STATUS,
  DELETE_USER,
} from "../../../../graphql/mutations/User";
import { LIST_USER } from "../../../../graphql/queries/User";
import useTableGlobalFilter from "../../../../hooks/useTableGlobalFilter";
import { ToastSeverity } from "../../../../utils/enums/toast.enum";
import { DataTableColumn } from "../../../../utils/interfaces/Table";
import { IUser } from "../../../../utils/interfaces/User";
import { showToast } from "../../../../utils/toastUtils";
import { Status } from "../../../../utils/types/StatusType";
import useUserList from "../../hooks/useUserList";
import UserForm from "./FormUser";
import UserDetail from "./UserDetail";
import { Card } from "primereact/card";
import { useDispatch } from "react-redux";
import { setIsBlocked } from "../../../../redux/slices/blockUISlice";

const UserList = () => {
  const { listUser, loadingListUser } = useUserList();
  const [visibleForm, setVisibleForm] = useState<boolean>(false);
  const [visibleDetail, setVisibleDetail] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<IUser | null>();

  const dispatch = useDispatch();

  const [switchUserState] = useMutation(CHANGE_USER_STATUS, {
    refetchQueries: [
      {
        query: LIST_USER,
      },
    ],
  });

  const [deleteUser] = useMutation(DELETE_USER, {
    refetchQueries: [
      {
        query: LIST_USER,
      },
    ],
  });

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

  const getIsGlobal = (rowData: IUser): Status | null => {
    switch (rowData.is_global) {
      case false:
        return {
          severity: "danger",
          label: "No global",
        };

      case true:
        return {
          severity: "success",
          label: "Global",
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

  const isGlobalBodyTemplate = (rowData: IUser) => {
    const status = getIsGlobal(rowData);
    if (status) {
      const { severity, label } = status;
      return (
        <Tag
          value={rowData.is_global}
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
        <h1 className="text-2xl font-bold">{`Lista de usuarios (${listUser.length})`}</h1>

        <Button
          icon="pi pi-plus"
          severity="success"
          tooltip="Nuevo usuario"
          tooltipOptions={{ position: "left" }}
          onClick={() => {
            setCurrentUser(null);
            setVisibleForm(true);
          }}
          raised
        />
      </div>
    );
  };

  const handleChangeUserStatus = async (userId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await switchUserState({
        variables: {
          userId,
        },
      });

      if (data.switchUserState.is_active) {
        showToast({
          detail: "Usuario activado.",
          severity: ToastSeverity.Success,
        });
      } else {
        showToast({
          detail: "Usuario desactivado.",
          severity: ToastSeverity.Warn,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      dispatch(setIsBlocked(true));
      const { data } = await deleteUser({
        variables: {
          userId,
        },
      });

      if (data.deleteUser.success) {
        showToast({
          detail: "Usuario eliminado.",
          severity: ToastSeverity.Success,
        });
      }
    } catch (error: any) {
      showToast({ detail: error.message, severity: ToastSeverity.Error });
    } finally {
      dispatch(setIsBlocked(false));
    }
  };

  const actionBodyTemplate = (rowData: IUser) => {
    return (
      <div className="flex justify-center items-center gap-2">
        <Button
          icon="pi pi-pencil"
          className="p-button-rounded p-button-info"
          onClick={() => {
            setCurrentUser(rowData);
            setVisibleForm(true);
          }}
          tooltip="Editar usuario"
          tooltipOptions={{ position: "left" }}
        />

        <Button
          tooltip="Eliminar usuario"
          tooltipOptions={{ position: "left" }}
          icon="pi pi-trash"
          raised
          severity="danger"
          aria-label="Cancel"
          onClick={() => handleDeleteUser(rowData._id)}
        />

        <InputSwitch
          checked={rowData.is_active}
          onChange={() => handleChangeUserStatus(rowData._id)}
          tooltip={`${rowData.is_active ? "Desactivar" : "Activar"} usuario`}
          tooltipOptions={{ position: "left" }}
        />
      </div>
    );
  };

  const handleSelectionChange = (
    e: DataTableSelectionSingleChangeEvent<IUser[]>
  ) => {
    setCurrentUser(e.value);
    setVisibleDetail(true);
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
      style: { width: "15%" },
    },
    {
      field: "role.description",
      header: "Descripcion",
      style: { width: "30%" },
    },
    {
      field: "is_global",
      header: "Global",
      sortable: true,
      body: isGlobalBodyTemplate,
      style: { width: "10%", textAlign: "center" },
    },
    {
      field: "is_active",
      header: "Estado",
      sortable: true,
      body: statusBodyTemplate,
      style: { width: "10%", textAlign: "center" },
    },
  ]);

  const { filters, renderFilterInput } = useTableGlobalFilter(columns);

  if (loadingListUser) {
    return <LoadingSpinner />;
  }
  return (
    <Card className="py-2" header={tableHeaderTemplate}>
      <Table
        columns={columns}
        data={listUser}
        emptyMessage="Sin usuarios."
        editMode="row"
        size="small"
        dataFilters={filters}
        actionBodyTemplate={actionBodyTemplate}
        tableHeader={renderFilterInput}
        onSelectionChange={handleSelectionChange}
      />
      <Dialog
        header={currentUser ? "Editar Usuario" : "Nuevo Usuario"}
        visible={visibleForm}
        onHide={() => setVisibleForm(false)}
      >
        <UserForm setVisibleForm={setVisibleForm} userToEdit={currentUser} />
      </Dialog>
      <Dialog
        className="md:w-[90vw] w-[90vw]"
        visible={visibleDetail}
        header={currentUser && `Detalle de usuario`}
        onHide={() => setVisibleDetail(false)}
      >
        {currentUser && <UserDetail user={currentUser} />}
      </Dialog>
    </Card>
  );
};

export default UserList;
