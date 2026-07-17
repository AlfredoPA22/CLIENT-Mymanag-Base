import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import ChatBot from "../chatbot/ChatBot";
import { useFullProcessTour } from "../../hooks/useFullProcessTour";
import Navbar from "../navbar/NavBar";
import SidebarMenu from "../sidebar/SideBar";
import TopBar from "../topbar/TopBar";
import TourFab from "../tour/TourFab";
import { ROUTES_MOCK } from "../../routes/RouteMocks";

const Dashboard = () => {
  const [visibleSidebar, setVisibleSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { pathname } = useLocation();
  useFullProcessTour();

  // En Inicio el buscador y las notificaciones ya están incrustados en la
  // fila de saludo (ver Home.tsx) — no se duplican con la barra superior.
  const isHomePage = pathname === ROUTES_MOCK.DASHBOARD;

  return (
    <div className="flex h-screen">
      {/* Sidebar fijo en pantallas medianas en adelante */}
      <div className="hidden md:flex">
        <SidebarMenu
          fixed
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* Sidebar tipo overlay en móviles */}
      <SidebarMenu
        visible={visibleSidebar}
        onHide={() => setVisibleSidebar(false)}
        overlay
      />

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col overflow-auto min-w-0">
        {/* Navbar solo en móviles */}
        <div className="block md:hidden">
          <Navbar onToggleSidebar={() => setVisibleSidebar(true)} />
        </div>

        {/* Barra superior (búsqueda global, notificaciones) solo en escritorio */}
        {!isHomePage && <TopBar />}

        <main className="p-4 md:p-6 flex-1 overflow-auto">
          <Outlet />
          <div className="hidden md:block">
            <TourFab />
            <ChatBot />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
