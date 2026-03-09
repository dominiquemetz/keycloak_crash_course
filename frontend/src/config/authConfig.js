/**
 * OIDC Configuration for Keycloak
 *
 * TODO: Students need to configure the following parameters:
 *
 * 1. authority: The Keycloak realm URL
 *    Format: http://localhost:8080/realms/{realm-name}
 *    Example: http://localhost:8080/realms/demo-realm
 *
 * 2. client_id: The client ID created in Keycloak
 *    Example: demo-client
 *
 * After configuring Keycloak:
 * - Create a realm
 * - Create a client with the correct redirect URIs
 * - Update these values accordingly
 */

export const oidcConfig = {
  // TODO: Replace with your Keycloak realm URL
  authority: "http://localhost:8080/realms/crashcourse",

  // TODO: Replace with your client ID from Keycloak
  client_id: "frontend",

  redirect_uri: "http://localhost:3000",
  post_logout_redirect_uri: "http://localhost:3000",

  response_type: "code",
  scope: "openid read:books read:videos",

  automaticSilentRenew: true,
  loadUserInfo: true,
};
