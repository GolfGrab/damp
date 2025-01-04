import { HomeOutlined, InfoOutlined } from "@mui/icons-material";
import { CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Branding, Navigation } from "@toolpad/core";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Outlet, useNavigate } from "react-router-dom";
import { getOidcConfig } from "./auth/config";

const NAVIGATION: Navigation = [
  {
    kind: "header",
    title: "Toolpad",
  },
  {
    title: "Home",
    icon: <HomeOutlined />,
  },
  {
    title: "About",
    segment: "about",
    icon: <InfoOutlined />,
  },
];

const BRANDING: Branding = {
  title: "Noti Infrastructure",
};

export const App = () => {
  const auth = useAuth();
  const queryClient = new QueryClient();

  return (
    <>
      <CssBaseline enableColorScheme />
      <AppProvider
        navigation={NAVIGATION}
        branding={BRANDING}
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
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
      </AppProvider>
    </>
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
