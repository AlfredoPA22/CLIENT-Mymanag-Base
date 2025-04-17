import { TabPanel, TabView } from "primereact/tabview";
import UserList from "./user/UserList";
import RoleList from "./role/RoleList";
import useAuth from "../../auth/hooks/useAuth";

const AdminPage = () => {
  const { permissions } = useAuth();

  const hasPermission = (requiredPermissions: string[]) => {
    if (requiredPermissions.length === 0) return true;
    return requiredPermissions.some((perm) => permissions.includes(perm));
  };

  const panels = [
    {
      header: "Usuarios",
      permission: ["USER_AND_ROLE"],
      content: <UserList />,
    },
    {
      header: "Roles",
      permission: ["USER_AND_ROLE"],
      content: <RoleList />,
    },
  ];

  return (
    <TabView className="size-full">
      {panels
        .filter((panel) => hasPermission(panel.permission))
        .map((panel, index) => (
          <TabPanel header={panel.header} key={index}>
            {panel.content}
          </TabPanel>
        ))}
    </TabView>
  );
};

export default AdminPage;
