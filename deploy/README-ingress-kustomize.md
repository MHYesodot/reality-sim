## Ingress + Probes + Resources

- Helm chart כולל Ingress עם TLS + תמיכת WebSocket ל־`/socket.io` → realtime.
- לכל השירותים הוגדרו `livenessProbe`/`readinessProbe` ו־Requests/Limits (ניתנים לשינוי ב־`values.yaml`).

## Kustomize
- `kustomize/base` — מניפסטים בסיסיים (כולל Ingress).
- `kustomize/overlays/{dev,stage,prod}` — מחליפים host ב־Ingress (אפשר להוסיף גם משאבים שונים).
- הפעלה לדוגמה:
  ```bash
  kubectl apply -k kustomize/overlays/dev
  ```
