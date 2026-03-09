import { AuthProviderProps } from 'react-oidc-context';

// OIDC Configuration for Keycloak
export const oidcConfig: AuthProviderProps = {
  authority: "http://localhost:8080/realms/crashcourse",
  client_id: "frontend",

  redirect_uri: "http://localhost:3000",
  post_logout_redirect_uri: "http://localhost:3000",

  response_type: "code",
  scope: "openid read:videos read:books",

  automaticSilentRenew: true,
  loadUserInfo: true,
};
