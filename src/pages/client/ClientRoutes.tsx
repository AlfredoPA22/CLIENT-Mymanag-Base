import { Routes, Route } from "react-router-dom";
import ClientList from "./pages/ClientList";

const ClientRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ClientList />} />
    </Routes>
  );
};

export default ClientRoutes;
