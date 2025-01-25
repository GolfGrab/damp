import { createTheme, CssBaseline } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProvider } from "@toolpad/core/react-router-dom";
import { AuthProvider, useAuth } from "react-oidc-context";
import { Outlet, useNavigate } from "react-router-dom";
import { getOidcConfig } from "./auth/config";

const theme = createTheme({
  colorSchemes: {
    dark: {
      palette: {
        mode: "dark",
        primary: {
          main: "#e1b6ff",
          contrastText: "#4c007c",
          light: "rgb(231, 196, 255)",
          dark: "rgb(157, 127, 178)",
        },

        secondary: {
          main: "#d2c1d9",
          contrastText: "#372c3f",
          light: "rgb(219, 205, 224)",
          dark: "rgb(147, 135, 151)",
        },

        contrastThreshold: 3,
        tonalOffset: 0.2,
      },
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
  components: {
    MuiCssBaseline: {
      defaultProps: {
        enableColorScheme: true,
      },
      styleOverrides: {
        "*::-webkit-scrollbar": {
          width: "12px",
          height: "12px",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#968e98",
          borderRadius: "10px",
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "#211f22",
          borderRadius: "10px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
  },
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

export const App = () => {
  const auth = useAuth();
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
        theme={theme}
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
