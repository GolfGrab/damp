import { useEffect, useState } from "react";
import { hasAuthParams, useAuth } from "react-oidc-context";
import { Outlet } from "react-router-dom";
import { axiosInstance } from "../api";

const SecuredRoute = () => {
  const auth = useAuth();
  const [hasTriedSignin, setHasTriedSignin] = useState(false);
  const [hasTriedAfterError, setHasTriedAfterError] = useState(false);

  // automatically sign-in
  useEffect(() => {
    if (
      !hasAuthParams() &&
      !auth.isAuthenticated &&
      !auth.activeNavigator &&
      !auth.isLoading &&
      !hasTriedSignin
    ) {
      auth.signinRedirect({
        state: {
          returnTo: window.location,
        },
      });
      setHasTriedSignin(true);
    }
  }, [auth, hasTriedSignin]);

  // retry after error
  useEffect(() => {
    const allowedRetryErrors = [
      "Invalid refresh token state",
      "No matching state found",
    ];
    if (
      auth.error &&
      !hasTriedAfterError &&
      allowedRetryErrors.some((error) => auth.error?.message.startsWith(error))
    ) {
      auth.signinRedirect({
        state: {
          returnTo: window.location,
        },
      });
      setHasTriedAfterError(true);
    }
  }, [auth, hasTriedAfterError]);

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
    return (
      <>
        <div>Oops... {auth.error.message}</div>
        <button
          onClick={() =>
            auth.signinRedirect({
              state: {
                returnTo: window.location,
              },
            })
          }
        >
          Retry
        </button>
      </>
    );
  }

  axiosInstance.defaults.headers.common["Authorization"] =
    `Bearer ${auth.user?.access_token}`;

  return <Outlet />;
};

export default SecuredRoute;
