import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Outlet, useNavigate } from "react-router-dom";
import { getOidcConfig } from "./auth/config";

export const App = () => {
  const auth = useAuth();
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <CssBaseline enableColorScheme />
      <AppProvider
        session={
          auth.isAuthenticated && auth.user
            ? {
                user: {
                  name: auth.user.profile.email,
                  email: undefined,
                  id: auth.user.profile.sub,
                  image: auth.user.profile.picture,
                },
              }
            : undefined
        }
        authentication={{
          signIn: () =>
            void auth.signinRedirect({
              state: {
                returnTo: window.location,
              },
            }),
          signOut: () => void auth.signoutRedirect(),
        }}
      >
        <Outlet />
      </AppProvider>
    </QueryClientProvider>
  );
};

export const AppWithAuth = () => {
  const navigator = useNavigate();
  return (
    <AuthProvider {...getOidcConfig(navigator)}>
      <App />
    </AuthProvider>
  );
};
