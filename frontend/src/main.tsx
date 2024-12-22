import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { createTheme, ThemeProvider } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "react-oidc-context";
import { BrowserRouter, useNavigate } from "react-router";
import { getOidcConfig } from "./auth/config";
import AppRouter from "./routers/app-router";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

export const App = () => {
  const navigator = useNavigate();
  return (
    <AuthProvider {...getOidcConfig(navigator)}>
      <CssBaseline enableColorScheme />
      <ThemeProvider theme={theme}>
        <AppRouter />
      </ThemeProvider>
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
