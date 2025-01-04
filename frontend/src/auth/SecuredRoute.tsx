import { useEffect, useState } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";
import { axiosInstance } from "../api";

const SecuredRoute = () => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);

  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      // save the current path to redirect back to it after sign-in
      localStorage.setItem("recentPath", window.location.pathname);
      auth.signinRedirect({
        state: {
          returnTo: window.location,
        },
      });
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  switch (auth.activeNavigator) {
    case "signinSilent":
      return <div>Signing you in...</div>;
    case "signoutRedirect":
      return <div>Signing you out...</div>;
  }

  if (auth.isLoading) {
    return <div>Loading...</div>;
  }

  if (auth.error) {
    return <div>Oops... {auth.error.message}</div>;
  }

  axiosInstance.defaults.headers.common["Authorization"] =
    `Bearer ${auth.user?.access_token}`;

  return <Outlet />;
};

export default SecuredRoute;
