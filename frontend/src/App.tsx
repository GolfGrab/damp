import { HomeOutlined, InfoOutlined } from "@mui/icons-material";
import { CssBaseline } from "@mui/material";
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
  homeUrl: import.meta.env.BASE_URL,
  title: "Noti Back-Office",
};

export const App = () => {
  const auth = useAuth();

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
                  name: auth.user.profile.name,
                  email: auth.user.profile.email,
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
