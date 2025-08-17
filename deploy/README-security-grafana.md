## Security Hardening
- **CORS whitelist** דרך `ALLOWED_ORIGINS` (CSV).
- **Helmet CSP**: מגביל `connect-src` לכתובות מה־whitelist.
- **Rate limits**: גלובלי (`RATE_LIMIT_WINDOW_MS`, `RATE_LIMIT_MAX`) + מחמיר למסלולי `/auth/*`.
- **Realtime**: מגבלת התחברויות לדקה לפי IP (בסיסית; מומלץ לשכלל ל־redis/token bucket ב־prod).

## Grafana
דשבורדים לדוגמה ב־`monitoring/grafana/dashboards/`:
- `api_gateway.json` — תעבורה, p95 latency, שגיאות.
- `realtime_ws.json` — חיבורים חיים, קצב אירועים.
- `workers.json` — קצבי אירועים לשירותים.

טען את הקבצים ישירות לתוך Grafana או באמצעות sidecar שמרנדר קונפיגמפה.
