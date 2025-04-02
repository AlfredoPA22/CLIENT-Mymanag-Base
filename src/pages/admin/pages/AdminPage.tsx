import { TabPanel, TabView } from "primereact/tabview";
import UserList from "./user/UserList";
import RoleList from "./role/RoleList";

const AdminPage = () => {
  return (
    <TabView className="size-full">
      <TabPanel header="Usuarios">
        <UserList />
      </TabPanel>
      <TabPanel header="Roles">
        <RoleList />
      </TabPanel>
    </TabView>
  );
};

export default AdminPage;
