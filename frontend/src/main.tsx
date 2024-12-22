import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter, useNavigate } from "react-router";
import { getOidcConfig } from "./auth/config";
import "./index.css";
import AppRouter from "./routers/app-router";

export const App = () => {
  const navigator = useNavigate();
  return (
    <AuthProvider {...getOidcConfig(navigator)}>
      <div>web origin: {window.location.origin}</div>
      <div>pathname: {window.location.pathname}</div>
      <div>oidcConfig: {JSON.stringify(getOidcConfig(navigator))}</div>
      <AppRouter />
    </AuthProvider>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
