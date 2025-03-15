import { Route, Routes } from "react-router-dom";
import ProviderList from "./pages/ProviderList";

const ProviderRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProviderList />} />
    </Routes>
  );
};

export default ProviderRoutes;
