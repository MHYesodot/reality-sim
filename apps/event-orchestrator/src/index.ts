import promClient from 'prom-client';
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });
const metricCounter = new promClient.Counter({ name: 'event_orchestrator_events_total', help: 'Events processed' });
registry.registerMetric(metricCounter);

import { subscribe, publish } from '@messaging/reality-sim';

async function main() {
  await subscribe('sim.tick', async (tick: any) => { metricCounter.inc();
    const hot = (tick.deltas||[]).filter((d:any)=> (d.traffic||0) > 0.8).slice(0,5).map((d:any)=>({ x:d.x, y:d.y }));
    if (hot.length === 0) return;
    const ev = {
      type: 'traffic_spike',
      tiles: hot,
      severity: Math.min(5, 1 + Math.floor(hot.length/2)),
      reason: 'traffic>0.8',
      at: new Date().toISOString()
    };
    await publish('world.event', ev);
  });
  console.log('[event-orchestrator] listening sim.tick; emitting world.event');
}
main().catch((e)=>{ console.error(e); process.exit(1); });


import http from 'http';
const PORT = Number(process.env.PORT || 8081);
http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.url === '/metrics') {
    res.writeHead(200, { 'content-type': registry.contentType });
    return registry.metrics().then((m: string) => res.end(m));
  }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`[health] listening on ${PORT}`));
