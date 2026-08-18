import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";

import "primeicons/primeicons.css";
import "./index.css";
import "primereact/resources/themes/lara-light-blue/theme.css";
import apolloClient from "./ApolloClient.ts";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./redux/store.ts";
import LoadingSpinner from "./components/LoadingSpinner/LoadingSpinner.tsx";

// `redux-persist` guarda el estado (incluido el token de sesión) en storage
// ASÍNCRONO (IndexedDB vía localforage, no localStorage sincrónico) — sin
// PersistGate, <App/> se renderizaba de inmediato, antes de que el token
// terminara de rehidratarse. Las primeras queries de esa carga (ej. listar
// almacenes o clientes) salían sin el header de autenticación, el backend
// las rechazaba, y como esos hooks usan fetchPolicy "network-only" sin
// reintento, el select quedaba vacío el resto de la sesión — un F5 solo
// "arreglaba" el problema por azar (otra carrera, no una corrección real).
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={<LoadingSpinner className="min-h-screen" />} persistor={persistor}>
            <App />
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </ApolloProvider>
  </React.StrictMode>
);
