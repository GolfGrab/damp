import { User, WebStorageStateStore } from "oidc-client-ts";
import { AuthProviderProps } from "react-oidc-context";
import { Location, NavigateFunction } from "react-router-dom";
import { axiosInstance } from "../api";

export const getOidcConfig = (
  navigator: NavigateFunction
): AuthProviderProps => ({
  authority: "https://api.asgardeo.io/t/damp/oauth2/token",
  client_id: "TRnCWdQg0YXiEzWECZ3S_hkkfpwa",
  redirect_uri: window.location.origin + "/auth/callback",
  scope: "openid email groups profile",
  onSigninCallback: (user): void => {
    navigator((user?.state as { returnTo: Location })?.returnTo ?? "/");
  },
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: window.localStorage }),
  automaticSilentRenew: true,
});

axiosInstance.interceptors.request.use((config) => {
  const oidcStorage = localStorage.getItem(
    `oidc.user:https://api.asgardeo.io/t/damp/oauth2/token:TRnCWdQg0YXiEzWECZ3S_hkkfpwa`
  );
  if (!oidcStorage) {
    return config;
  }

  const user = User.fromStorageString(oidcStorage);

  if (user && user.access_token) {
    config.headers.Authorization = `Bearer ${user.access_token}`;
  }
  return config;
});
