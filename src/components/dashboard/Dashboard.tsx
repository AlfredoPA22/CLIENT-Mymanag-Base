import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../navbar/NavBar";
import SidebarMenu from "../sidebar/SideBar";

const Dashboard = () => {
  const [visibleSidebar, setVisibleSidebar] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo en pantallas medianas en adelante */}
      <div className="hidden md:block">
        <SidebarMenu fixed />
      </div>

      {/* Sidebar tipo overlay en móviles */}
      <SidebarMenu
        visible={visibleSidebar}
        onHide={() => setVisibleSidebar(false)}
        overlay
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Navbar solo en móviles */}
        <div className="block md:hidden">
          <Navbar onToggleSidebar={() => setVisibleSidebar(true)} />
        </div>

        <main className="p-2 flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
