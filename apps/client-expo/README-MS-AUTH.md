# Microsoft Sign-In (Expo AuthSession)

1) Create an Azure App Registration (Multi-tenant) and copy the **Application (client) ID**.
2) In `apps/client-expo`, set:
   ```bash
   export EXPO_PUBLIC_MS_CLIENT_ID="<your-client-id>"
   ```
3) Start the app with `pnpm start`. Expo will handle the redirect via proxy in dev.
4) Server env: set `MS_CLIENT_ID` in `.env` to the same client ID so JWT verification succeeds.
