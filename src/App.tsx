import { ConfirmDialog } from "primereact/confirmdialog";
import { Provider } from "react-redux";
import "./App.css";
import ToastGlobal from "./components/toast/ToastGlobal";
import store from "./redux/store";
import AppRoutes from "./routes/AppRoutes";

function App() {
  return (
    <Provider store={store}>
      <ToastGlobal />
      <ConfirmDialog />
      <AppRoutes />
    </Provider>
  );
}

export default App;
