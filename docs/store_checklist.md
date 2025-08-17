# Store Submission Checklist (Apple App Store + Microsoft Store)

## Apple (iPad → Mac Catalyst)
- [ ] Bundle ID (matches `APPLE_BUNDLE_ID`), Sign-in with Apple enabled.
- [ ] App Privacy (Nutrition) filled: data types – Auth email, gameplay telemetry (opt-in), crash logs.
- [ ] ATS over HTTPS for all endpoints (Gateway + Realtime via Nginx/WSS).
- [ ] Screenshots: iPad 12.9", iPad 11".
- [ ] App Icon & Splash set in `apps/client-expo/app.json` + Xcode asset catalogs.
- [ ] TestFlight build passes review (basic account creation works).

## Microsoft Store (Windows)
- [ ] MS App Registration (for Microsoft Sign-In), `MS_CLIENT_ID` set on server and `EXPO_PUBLIC_MS_CLIENT_ID` on client.
- [ ] MSIX package via RN Windows project (to be initialized), signed certificate.
- [ ] Store listing text, screenshots (Surface resolutions).

## Both
- [ ] Privacy Policy public URL (see template below) + link inside app Settings.
- [ ] In-app explanation of data usage (Settings → About/Privacy).
- [ ] Versioning & changelog.
