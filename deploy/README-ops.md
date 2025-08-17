## Autoscaling & Observability

### HPA
- Helm: bật/לכבות דרך `values.yaml` → `hpa.enabled` (ברירת מחדל: on), `minReplicas/maxReplicas` ויעדי CPU/Memory.
- Kustomize: דוגמאות `kustomize/base/hpa.yaml` ל־gateway/realtime.

### Metrics
- כל השירותים חושפים `/metrics` בפורמט Prometheus + `/health` ל־probes.
- Helm: `serviceMonitor.enabled=true` כדי ליצור `ServiceMonitor` (קלאסטר עם kube-prometheus-stack).

### Nginx (אופציונלי)
- `deploy/nginx.conf` עם gzip, buffers ו־timeouts ל־Socket.IO.
- אפשר לפרוס דרך Helm עם `nginx.enabled=true` או להשתמש ב־Ingress Controller קיים.
