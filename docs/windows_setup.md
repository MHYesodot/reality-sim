# React Native Windows Setup

> Target: Microsoft Store (PC/Tablet)

## Prerequisites
- Windows 11 with latest Visual Studio (Desktop development with C++ + UWP workload)
- Node.js 18.x, Yarn/PNPM
- Git, PowerShell

## Steps (Bare workflow)
1. From the client app, prebuild to bare:
   ```bash
   cd apps/client-expo
   npx expo prebuild --platform windows
   ```
2. Add React Native Windows:
   ```powershell
   npx react-native-windows-init --overwrite --language cpp
   ```
3. Build MSIX package:
   - Open the generated Visual Studio solution under `windows/`
   - Configure Signing (Temporary self-signed or your Store certificate)
   - Build → Publish → Create App Packages (MSIX)
4. WebSocket/HTTPS:
   - Ensure your gateway/realtime endpoints are HTTPS/WSS reachable from the device.
5. Microsoft Store submission:
   - Reserve app name in Partner Center
   - Upload MSIX + screenshots
   - Configure identity/sign-in text (if using Microsoft Account OAuth)

## Scripted bootstrap (optional)
Run `scripts/windows-init.ps1` from a **Developer PowerShell for VS** prompt.
