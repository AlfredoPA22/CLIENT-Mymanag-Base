import { Badge } from "primereact/badge";
import { Card } from "primereact/card";
import { FC } from "react";
import { IUser } from "../../../../utils/interfaces/User";

interface UserDetailProps {
  user: IUser;
}

const UserDetail: FC<UserDetailProps> = ({ user }) => {
  return (
    <div className="flex flex-col gap-4">
      <Card className="bg-white shadow-lg rounded-2xl p-6 border-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">{user.user_name}</h2>
          <Badge
            value={user.is_active ? "Activo" : "Inactivo"}
            severity={user.is_active ? "success" : "danger"}
          />
        </div>

        <div className="flex flex-col gap-2 text-gray-700 text-sm">
          <div className="flex items-center gap-2">
            <i className="pi pi-id-card text-blue-500"></i>
            <span className="font-medium">Rol:</span>
            <span>{user.role.name}</span>
          </div>

          <div className="flex items-center gap-2">
            <i className="pi pi-align-left text-blue-500"></i>
            <span className="font-medium">Descripción:</span>
            <span>{user.role.description}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserDetail;
