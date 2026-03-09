# Keycloak Crash Course

This hands-on workshop guides you through configuring Keycloak as an OAuth 2.0 / OpenID Connect identity provider and integrating it with a React frontend and Spring Boot backend using modern security best practices.

## Architecture Overview

### Backend
- **Technology**: Spring Boot with Spring Security OAuth 2.0 Resource Server
- **Endpoints**: Two protected endpoints in [DemoController.java](backend/src/main/java/keycloak/crash/course/resourceserver/controller/DemoController.java)
- **Authorization**: Scope-based using `@PreAuthorize` annotations
  - Example: `@PreAuthorize("hasAuthority('SCOPE_read')")` requires the `read` scope in the access token
  - Spring Security automatically extracts scopes from JWT access tokens and converts them to authorities with the `SCOPE_` prefix

### Frontend
- **Technology**: React with TypeScript
- **Authentication**: OIDC client library (pre-installed)
- **Role**: Acts as the OAuth 2.0 client, authenticating users and accessing the backend on their behalf

## Prerequisites

- Docker and Docker Compose installed

## Getting Started

### 1. Start the Infrastructure

```bash
docker compose --profile auth up -d
```

This command starts:
- **Keycloak**: http://localhost:8080 (admin console)
- **Web IDE**: http://localhost:3001 (code-server)

### 2. Configure Keycloak

Access the Keycloak admin console at http://localhost:8080 and complete the following configuration steps:

#### 2.1. Create a Realm
1. Click **Create Realm** in the dropdown menu
2. Name your realm (e.g., `crash-course`)
3. Click **Create**

#### 2.2. Create Client Scopes
Create two custom client scopes for backend authorization:

1. Navigate to **Client Scopes** → **Create client scope**
2. Create the following scopes:
   - **Scope 1**: Name: `read`, Protocol: `openid-connect`
   - **Scope 2**: Name: `write`, Protocol: `openid-connect`

**Important**: For each scope, enable `Include in token scope` so that the scope is added to the access token.

#### 2.3. Create an OIDC Client
1. Navigate to **Clients** → **Create client**
2. Configure the client:
   - **Client ID**: `frontend-client` (or your preferred ID)
   - **Client authentication**: OFF (public client)
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Valid post logout redirect URIs**: `+`
   - **Web origins**: `+`

#### 2.4. Assign Client Scopes to Client
1. Open your client → **Client scopes** tab
2. Click **Add client scope**
3. Add your scopes as **Optional** scopes
4. This allows users to request these scopes during authentication

#### 2.5. Create a Test User
1. Navigate to **Users** → **Create new user**
2. Set username (e.g., `testuser`)
3. Click **Create**
4. Open the user → **Credentials** tab
5. Click **Set password**
   - Enter a password
   - **Temporary**: OFF (prevents forced password change on first login)
6. Click **Save**

### 3. Configure the Frontend Application

Open the Web IDE at http://localhost:3001 and edit the configuration:

#### File: `frontend/src/config/authConfig.ts`

Set the following properties:

```typescript
authority: 'http://localhost:8080/realms/{your-realm-name}'  // Replace {your-realm-name}
client_id: 'frontend-client'  // Match the client ID from Keycloak
scope: 'openid read:books read:videos'  // Include your custom scopes
```

**Technical Details**:
- **authority**: The OpenID Connect discovery endpoint base URL (issuer URL)
- **client_id**: Must match the client ID configured in Keycloak
- **scope**: Space-separated list of scopes; include `openid` (required) and your custom scopes

### 4. Configure the Backend Application

#### File: `backend/src/main/resources/application.properties`

Set the following Spring Security OAuth 2.0 Resource Server properties:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/{your-realm-name}
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://keycloak:8080/realms/{your-realm-name}/protocol/openid-connect/certs
```

**Technical Details**:
- **issuer-uri**: Used for JWT validation; Spring Security will verify that tokens have this exact issuer claim
- **jwk-set-uri**: The JWKS (JSON Web Key Set) endpoint used to fetch public keys for JWT signature verification
  - Can be discovered at `{issuer-uri}/.well-known/openid-configuration` under the `jwks_uri` field

## Running the Applications
```shell
docker compose --profile app up -d --build
```

## Testing the Integration

1. Open the frontend at http://localhost:3000
2. Click **Login** to initiate the OAuth 2.0 Authorization Code flow
3. Authenticate with your test user credentials
4. The frontend will receive an access token with the requested scopes
5. Try accessing the protected backend endpoints:
   - Endpoints requiring `read:books` scope should work if you requested it
   - Endpoints requiring `read:videos` scope should work if you requested it

## OAuth 2.0 Flow Overview

1. **Authorization Request**: Frontend redirects user to Keycloak with client ID, redirect URI, and requested scopes
2. **User Authentication**: User logs in at Keycloak
3. **Authorization Grant**: Keycloak redirects back with authorization code
4. **Token Exchange**: Frontend exchanges code for access token and ID token
5. **API Access**: Frontend includes access token in `Authorization: Bearer {token}` header when calling backend
6. **Token Validation**: Backend validates JWT signature using JWKS and checks issuer and scope claims

## Troubleshooting

### Common Issues

- **Invalid redirect URI**: Ensure the redirect URI in Keycloak exactly matches the frontend URL
- **Missing scopes in token**: Verify client scopes are added as **Optional** and properly mapped
- **CORS errors**: Check that Web Origins is configured in the Keycloak client
- **401 Unauthorized**: Verify the issuer-uri matches exactly (including realm name)
- **Token signature validation fails**: Ensure jwk-set-uri is correctly configured and accessible

### Verification Commands

Check OpenID Connect discovery document:
```bash
curl http://localhost:8080/realms/{your-realm-name}/.well-known/openid-configuration | jq
```

Inspect access token (decode JWT at https://jwt.io or use):
```bash
echo "{token}" | cut -d. -f2 | base64 -d | jq
```

## Learning Objectives

By completing this workshop, you will understand:
- How to configure Keycloak as an OAuth 2.0 / OIDC provider
- The difference between client scopes and roles
- How OAuth 2.0 Authorization Code flow works with PKCE
- How to implement scope-based authorization in Spring Boot
- How JWT access tokens are validated using JWKS
- Best practices for public clients (SPAs) and resource servers