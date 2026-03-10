# Keycloak Crash Course

This hands-on workshop guides you through configuring Keycloak as an OAuth 2.0 / OpenID Connect identity provider and integrating it with a React frontend and Spring Boot backend.

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
   - **Scope 1**: Name: `read:books`, Protocol: `openid-connect`
   - **Scope 2**: Name: `read:videos`, Protocol: `openid-connect`

**Important**: For each scope, enable `Include in token scope` so that the scope is added to the access token.

#### 2.3. Create an OIDC Client
1. Navigate to **Clients** → **Create client**
2. Configure the client:
   - **Client ID**: `frontend` (or your preferred ID)
   - **Client authentication**: OFF (public client)
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Valid post logout redirect URIs**: `+`
   - **Web origins**: `+`

#### 2.4. Assign Client Scopes to Client
1. Open your client → **Client scopes** tab
2. Click **Add client scope**
3. Add your scopes as **Optional** scopes
4. This allows the client to request these scopes during authentication

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
client_id: 'frontend'  // Match the client ID from Keycloak
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
4. **Token Exchange**: Frontend exchanges code for access token, refresh token and ID token
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

---

# Keycloak Crash Course (Deutsch)

Dieser praxisorientierte Workshop führt Sie durch die Konfiguration von Keycloak als OAuth 2.0 / OpenID Connect Identity Provider und dessen Integration mit einem React-Frontend und Spring Boot-Backend.

## Architektur-Übersicht

### Backend
- **Technologie**: Spring Boot mit Spring Security OAuth 2.0 Resource Server
- **Endpunkte**: Zwei geschützte Endpunkte in [DemoController.java](backend/src/main/java/keycloak/crash/course/resourceserver/controller/DemoController.java)
- **Autorisierung**: Scope-basiert mittels `@PreAuthorize`-Annotationen
  - Beispiel: `@PreAuthorize("hasAuthority('SCOPE_read')")` erfordert den `read`-Scope im Access Token
  - Spring Security extrahiert automatisch Scopes aus JWT Access Tokens und konvertiert sie in Authorities mit dem `SCOPE_`-Präfix

### Frontend
- **Technologie**: React mit TypeScript
- **Authentifizierung**: OIDC-Client-Bibliothek (vorinstalliert)
- **Rolle**: Fungiert als OAuth 2.0 Client, authentifiziert Benutzer und greift in deren Namen auf das Backend zu

## Voraussetzungen

- Docker und Docker Compose installiert

## Erste Schritte

### 1. Infrastruktur starten

```bash
docker compose --profile auth up -d
```

Dieser Befehl startet:
- **Keycloak**: http://localhost:8080 (Admin-Konsole)
- **Web-IDE**: http://localhost:3001 (code-server)

### 2. Keycloak konfigurieren

Öffnen Sie die Keycloak-Admin-Konsole unter http://localhost:8080 und führen Sie folgende Konfigurationsschritte durch:

#### 2.1. Realm erstellen
1. Klicken Sie im Dropdown-Menü auf **Create Realm**
2. Benennen Sie Ihren Realm (z.B. `crash-course`)
3. Klicken Sie auf **Create**

#### 2.2. Client Scopes erstellen
Erstellen Sie zwei benutzerdefinierte Client Scopes für die Backend-Autorisierung:

1. Navigieren Sie zu **Client Scopes** → **Create client scope**
2. Erstellen Sie folgende Scopes:
   - **Scope 1**: Name: `read:books`, Protocol: `openid-connect`
   - **Scope 2**: Name: `read:videos`, Protocol: `openid-connect`

**Wichtig**: Aktivieren Sie für jeden Scope `Include in token scope`, damit der Scope dem Access Token hinzugefügt wird.

#### 2.3. OIDC-Client erstellen
1. Navigieren Sie zu **Clients** → **Create client**
2. Konfigurieren Sie den Client:
   - **Client ID**: `frontend` (oder Ihre bevorzugte ID)
   - **Client authentication**: OFF (Public Client)
   - **Valid redirect URIs**: `http://localhost:3000/*`
   - **Valid post logout redirect URIs**: `+`
   - **Web origins**: `+`

#### 2.4. Client Scopes dem Client zuweisen
1. Öffnen Sie Ihren Client → Tab **Client scopes**
2. Klicken Sie auf **Add client scope**
3. Fügen Sie Ihre Scopes als **Optional** Scopes hinzu
4. Dies ermöglicht dem Client, diese Scopes während der Authentifizierung anzufordern

#### 2.5. Testbenutzer erstellen
1. Navigieren Sie zu **Users** → **Create new user**
2. Legen Sie einen Benutzernamen fest (z.B. `testuser`)
3. Klicken Sie auf **Create**
4. Öffnen Sie den Benutzer → Tab **Credentials**
5. Klicken Sie auf **Set password**
   - Geben Sie ein Passwort ein
   - **Temporary**: OFF (verhindert erzwungenen Passwortwechsel beim ersten Login)
6. Klicken Sie auf **Save**

### 3. Frontend-Anwendung konfigurieren

Öffnen Sie die Web-IDE unter http://localhost:3001 und bearbeiten Sie die Konfiguration:

#### Datei: `frontend/src/config/authConfig.ts`

Setzen Sie folgende Eigenschaften:

```typescript
authority: 'http://localhost:8080/realms/{your-realm-name}'  // Ersetzen Sie {your-realm-name}
client_id: 'frontend'  // Muss mit der Client-ID aus Keycloak übereinstimmen
scope: 'openid read:books read:videos'  // Fügen Sie Ihre benutzerdefinierten Scopes hinzu
```

**Technische Details**:
- **authority**: Die Basis-URL des OpenID Connect Discovery-Endpunkts (Issuer-URL)
- **client_id**: Muss mit der in Keycloak konfigurierten Client-ID übereinstimmen
- **scope**: Durch Leerzeichen getrennte Liste von Scopes; inkludieren Sie `openid` (erforderlich) und Ihre benutzerdefinierten Scopes

### 4. Backend-Anwendung konfigurieren

#### Datei: `backend/src/main/resources/application.properties`

Setzen Sie folgende Spring Security OAuth 2.0 Resource Server-Eigenschaften:

```properties
spring.security.oauth2.resourceserver.jwt.issuer-uri=http://localhost:8080/realms/{your-realm-name}
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=http://keycloak:8080/realms/{your-realm-name}/protocol/openid-connect/certs
```

**Technische Details**:
- **issuer-uri**: Wird für die JWT-Validierung verwendet; Spring Security überprüft, dass Tokens exakt diesen Issuer-Claim haben
- **jwk-set-uri**: Der JWKS-Endpunkt (JSON Web Key Set), der verwendet wird, um öffentliche Schlüssel für die JWT-Signaturprüfung abzurufen
  - Kann unter `{issuer-uri}/.well-known/openid-configuration` im Feld `jwks_uri` gefunden werden

## Anwendungen ausführen
```shell
docker compose --profile app up -d --build
```

## Integration testen

1. Öffnen Sie das Frontend unter http://localhost:3000
2. Klicken Sie auf **Login**, um den OAuth 2.0 Authorization Code Flow zu starten
3. Authentifizieren Sie sich mit Ihren Testbenutzer-Anmeldedaten
4. Das Frontend erhält ein Access Token mit den angeforderten Scopes
5. Versuchen Sie, auf die geschützten Backend-Endpunkte zuzugreifen:
   - Endpunkte, die den `read:books`-Scope erfordern, sollten funktionieren, wenn Sie diesen angefordert haben
   - Endpunkte, die den `read:videos`-Scope erfordern, sollten funktionieren, wenn Sie diesen angefordert haben

## OAuth 2.0 Flow-Übersicht

1. **Authorization Request**: Frontend leitet Benutzer zu Keycloak weiter mit Client-ID, Redirect-URI und angeforderten Scopes
2. **Benutzer-Authentifizierung**: Benutzer meldet sich bei Keycloak an
3. **Authorization Grant**: Keycloak leitet mit Authorization Code zurück
4. **Token-Austausch**: Frontend tauscht Code gegen Access Token, Refresh Token und ID Token aus
5. **API-Zugriff**: Frontend fügt Access Token im `Authorization: Bearer {token}`-Header ein, wenn es das Backend aufruft
6. **Token-Validierung**: Backend validiert JWT-Signatur mittels JWKS und prüft Issuer- und Scope-Claims

## Fehlerbehebung

### Häufige Probleme

- **Invalid redirect URI**: Stellen Sie sicher, dass die Redirect-URI in Keycloak exakt mit der Frontend-URL übereinstimmt
- **Fehlende Scopes im Token**: Überprüfen Sie, dass Client Scopes als **Optional** hinzugefügt und korrekt gemappt wurden
- **CORS-Fehler**: Prüfen Sie, dass Web Origins im Keycloak-Client konfiguriert ist
- **401 Unauthorized**: Überprüfen Sie, dass die issuer-uri exakt übereinstimmt (inkl. Realm-Name)
- **Token-Signaturvalidierung schlägt fehl**: Stellen Sie sicher, dass jwk-set-uri korrekt konfiguriert und erreichbar ist

### Verifizierungs-Befehle

OpenID Connect Discovery-Dokument prüfen:
```bash
curl http://localhost:8080/realms/{your-realm-name}/.well-known/openid-configuration | jq
```

Access Token inspizieren (JWT dekodieren unter https://jwt.io oder verwenden Sie):
```bash
echo "{token}" | cut -d. -f2 | base64 -d | jq
```
