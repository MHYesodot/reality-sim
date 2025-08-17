## Docker build & push (example)

```bash
# set your org/repo and tag
ORG=ghcr.io/<your-org>
TAG=v0.1.0

docker build -f deploy/Dockerfile.gateway -t $ORG/reality-gateway:$TAG .
docker build -f deploy/Dockerfile.realtime -t $ORG/reality-realtime:$TAG .
docker build -f deploy/Dockerfile.sim-engine -t $ORG/reality-sim-engine:$TAG .
docker build -f deploy/Dockerfile.event-orchestrator -t $ORG/reality-event-orchestrator:$TAG .
docker build -f deploy/Dockerfile.quest-ai -t $ORG/reality-quest-ai:$TAG .
docker build -f deploy/Dockerfile.progression -t $ORG/reality-progression:$TAG .

docker push $ORG/reality-gateway:$TAG
docker push $ORG/reality-realtime:$TAG
docker push $ORG/reality-sim-engine:$TAG
docker push $ORG/reality-event-orchestrator:$TAG
docker push $ORG/reality-quest-ai:$TAG
docker push $ORG/reality-progression:$TAG
```

> אם אתה משתמש ב־GHCR, ודא `docker login ghcr.io` וש־`packages:write` פעיל ל־GITHUB_TOKEN ב־CI.

## Kubernetes (Helm)

```bash
# ערוך charts/reality-sim/values.yaml או העבר overrides
helm upgrade --install reality ./charts/reality-sim   --set imageRepo=ghcr.io/<your-org>   --set imageTag=$TAG   --set secrets.JWT_SECRET="supersecret"   --set secrets.OPENAI_API_KEY=""
```

הצ'ארט כולל גם מניפסטים ל־Mongo/Redis/Rabbit (ל־dev). בפרודקשן עדיף פריסה מנוהלת.
