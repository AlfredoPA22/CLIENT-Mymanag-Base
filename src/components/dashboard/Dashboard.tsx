import Navbar from "../navbar/NavBar";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div>
      <Navbar />
      <main className="flex pt-[60px] sm:pt-0 min-h-[calc(100vh-122px)] w-full justify-center overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;
