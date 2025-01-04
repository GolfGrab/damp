import { WebStorageStateStore } from "oidc-client-ts";
import { AuthProviderProps } from "react-oidc-context";
import { Location, NavigateFunction } from "react-router-dom";

export const getOidcConfig = (
  navigator: NavigateFunction
): AuthProviderProps => ({
  authority: "https://api.asgardeo.io/t/damp/oauth2/token",
  client_id: "TRnCWdQg0YXiEzWECZ3S_hkkfpwa",
  redirect_uri: window.location.origin + "/auth/callback",
  scope: "openid email groups profile",
  onSigninCallback: (user): void => {
    navigator((user?.state as { returnTo: Location }).returnTo ?? "/");
  },
  userStore: new WebStorageStateStore({ store: window.localStorage }),
  stateStore: new WebStorageStateStore({ store: sessionStorage }),
});
