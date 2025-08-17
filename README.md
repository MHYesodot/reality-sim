# Reality Quest × SimuCityX — Starter Monorepo

This is a **minimal, production-minded scaffold** for the hybrid project we planned:
- **apps/**: backend services (gateway, realtime, sim-engine, world-ingestion, event-orchestrator, quest-ai, progression, geo-store)
- **packages/**: shared code (types, messaging, db, config, ai, utils, api-sdk)
- **deploy/**: docker-compose, nginx
- **apps/client/**: Placeholder for React Native apps (iOS/iPadOS to start), with instructions to init.

> Goal: get you coding TODAY. You can run backend services with Docker, then spin up RN apps for iPad + Windows using the commands below.

---

## Quick Start

### 1) Requirements
- Node 20+
- pnpm (`npm i -g pnpm`)
- Docker + Docker Compose
- (later) Xcode for iOS/iPad builds, Visual Studio 2022 for RN Windows

### 2) Install deps (root)
```bash
pnpm install
```

### 3) Environment
Copy the root `.env.example` to `.env` at the repository root. Services read from this file; create service-specific `.env` files only if you need to override values.

### 4) Run infra + core services
```bash
docker compose -f deploy/docker-compose.yml up -d
pnpm -w --filter "@apps/gateway" dev
pnpm -w --filter "@apps/realtime" dev
pnpm -w --filter "@apps/sim-engine" dev
```
Visit gateway health: http://localhost:8080/health

### 5) Initialize the React Native app (iPad first)
We keep **client** folder as a placeholder. To init an RN app now (Expo or bare):
```bash
cd apps
npx create-expo-app@latest client --template
# After creation, add shared packages aliases as described below.
```

- **iPad / iPhone**: run from Xcode or `npx expo run:ios`
- **Mac (Stage 2)**: enable Mac Catalyst in Xcode
- **Windows (Store)**: in parallel, create a separate RN Windows app:
```bash
cd apps
npx react-native init rn-windows --template react-native@latest
cd rn-windows
npx @react-native-windows/cli init --overwrite
```
Then reference shared packages from `packages/` via TS path aliases and PNPM workspaces.

---

## Workspaces
We use **pnpm workspaces** + **turborepo**. See `pnpm-workspace.yaml` and `turbo.json`.

## Services (dev URLs)
- gateway: http://localhost:8080
- realtime (Socket.IO): ws://localhost:8090
- rabbitmq manager: http://localhost:15672  (guest/guest)
- mongo: mongodb://localhost:27017
- redis: redis://localhost:6379

## OpenAI
Add `OPENAI_API_KEY` to `.env` and enable the `quest-ai` service when ready.
We default to **gpt-4o-mini**, with optional `priority:true` switching to **gpt-4o**.

---

## Store Targets
- **Apple App Store (iPad → Mac Catalyst)**: native RN app, WebView for MapLibre/Three.js, ATS-compliant TLS.
- **Microsoft Store (Windows)**: RN Windows app (MSIX).

---

## Next steps
- Start with `sim-engine` + `realtime` + `gateway` (already scaffolded).
- Initialize RN iOS app and connect to WS to render deltas.
- Gradually enable `world-ingestion`, `event-orchestrator`, `quest-ai`.

Good luck & have fun 🚀


---

## Expo Client (included)

```bash
cd apps/client-expo
pnpm install
pnpm start  # then choose iOS simulator or a connected iPad
# If WS/API aren't on localhost for device testing, set:
#   EXPO_PUBLIC_WS_URL=wss://<your-host>/socket.io
#   EXPO_PUBLIC_API_URL=https://<your-host>
```


### Enable the full pipeline (RabbitMQ + Mongo + WS)
```bash
docker compose -f deploy/docker-compose.yml up -d
pnpm -w --filter "@apps/realtime" dev
pnpm -w --filter "@apps/sim-engine" dev
pnpm -w --filter "@apps/event-orchestrator" dev
pnpm -w --filter "@apps/quest-ai" dev
pnpm -w --filter "@apps/progression" dev
pnpm -w --filter "@apps/gateway" dev
# Client
cd apps/client-expo && pnpm install && pnpm start
```
- The **sim-engine** publishes ticks → **event-orchestrator** emits `world.event` → **quest-ai** writes to Mongo & publishes `quest.generated` → **realtime** pushes to clients.
- Use **Quests** panel to Accept/Complete; XP updates via **progression** service and `/leaderboard` shows results.


### Auth (Email/Password, JWT)
- Register or Login at `/auth/register` and `/auth/login`.
- Client uses **Expo SecureStore** to keep the access token and attaches it as `Authorization: Bearer <token>`.
- Protected endpoints: `/quests`, `/leaderboard`, `/quests/*`.


### Auth (email/password, JWT with refresh)
- Endpoints: `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`
- Access token (15m) + refresh token (30d, stored in Redis). Rotation on `/auth/refresh`.
- Expo client stores tokens in **SecureStore** (fallback: AsyncStorage).

> In `QuestsPanel` calls now include `Authorization: Bearer <access>`.


### OAuth Setup (Apple + Microsoft)
- **Apple (iPad → Mac Catalyst)**: set `APPLE_BUNDLE_ID` in `.env` to your app bundle ID. Enable "Sign in with Apple" in your Apple Developer settings for that bundle.
- **Microsoft Account (Windows)**: create an App Registration in Azure AD; put the client id in:
  - Server: `MS_CLIENT_ID` (for verifying tokens)
  - Client: `EXPO_PUBLIC_MS_CLIENT_ID` (for initiating login)


### Deep Links
- Supported: `realitysim://quest/<id>` opens the quest modal automatically.
- Expo scheme is already set to `realitysim` in `app.json`.

### Privacy & Analytics
- Toggle analytics opt-in in **Settings**. Events are stored only when enabled.
- Server endpoints: `POST /privacy/consent`, `POST /analytics/event`.
- About/Privacy tab can load `EXPO_PUBLIC_PRIVACY_URL` if set, otherwise shows bundled info.


### Windows (React Native Windows)
See `docs/windows_setup.md` and `scripts/windows-init.ps1` to bootstrap RNW and create an MSIX.

### CI
- **server-ci**: typecheck + Docker build/push (GHCR). Add `deploy/Dockerfile.<service>` or adjust as needed.
- **client-eas-build**: runs EAS Build for iOS/Android (requires `EXPO_TOKEN` secret).
- **lint-and-typecheck**: basic checks on PRs.

### About & Contact
- **About** tab renders Markdown from `apps/client-expo/src/about.md` (embedded) or loads `EXPO_PUBLIC_PRIVACY_URL` in WebView.
- Contact link uses `mailto:support@example.com` (change to your email).


### Token Refresh (Client)
- האפליקציה שומרת `access`, `refresh`, ו-`sid` ב-**SecureStore**.
- כל בקשת API עוברת דרך `ensureAccess()`; אם נשארו <2 דקות לתוקף — קוראת `/auth/refresh` (Rotation).
- ב-401 מנסה ריענון פעם אחת ואז נכשלת אלגנטית.

### Sessions UI
- **Settings → Sessions**: מציג את כל הסשנים, מסמן את המכשיר הנוכחי (`this device`) ומאפשר **Revoke** פר־מכשיר או **Logout all**.


### WebSocket Auto-Reconnect with Fresh JWT
- הלקוח מאזין ל־onToken() — כל ריענון/התחברות מחליף את הטוקן ומבצע reconnect.
- במקרה של `connect_error: unauthorized` מתבצע נסיון ריענון + חיבור חדש עם הטוקן המעודכן.
