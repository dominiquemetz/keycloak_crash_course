import { AuthProviderProps } from 'react-oidc-context';

// OIDC Configuration for Keycloak
export const oidcConfig: AuthProviderProps = {
  // TODO: Set authority to the URL for our Keycloak and the Realm we are using
  authority: "",
  // TODO: Set the client ID to our created client
  client_id: "",

  redirect_uri: "http://localhost:3000",
  post_logout_redirect_uri: "http://localhost:3000",

  response_type: "code",
  // TODO: Add the necessary scopes to access the Backend
  scope: "openid",

  automaticSilentRenew: true,
};
