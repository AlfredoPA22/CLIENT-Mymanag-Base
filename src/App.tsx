import { useSelector } from "react-redux";

import { BlockUI } from "primereact/blockui";
import { ConfirmDialog } from "primereact/confirmdialog";

import "./App.css";

import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner";
import ToastGlobal from "./components/toast/ToastGlobal";

import { getIsBlocked } from "./redux/accessors/blockUI.accessor";

import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <>
      <BlockUI
        blocked={useSelector(getIsBlocked)}
        template={<LoadingSpinner />}
        fullScreen
      />
      <ToastGlobal />
      <ConfirmDialog />
      <AppRoutes />
    </>
  );
}

export default App;
