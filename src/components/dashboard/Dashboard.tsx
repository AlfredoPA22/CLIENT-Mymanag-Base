import { Outlet } from "react-router-dom";
import Navbar from "../navbar/NavBar";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <main className="flex p-2 sm:pt-0 min-h-[calc(100vh-122px)] w-full justify-center overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
