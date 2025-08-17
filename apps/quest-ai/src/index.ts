import promClient from 'prom-client';
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });
const metricCounter = new promClient.Counter({ name: 'quest_ai_events_total', help: 'Events processed' });
registry.registerMetric(metricCounter);

import { subscribe, publish } from '@messaging/reality-sim';
import { mongo } from '@db/reality-sim';
import type { OrchestratedEvent, Quest } from '@reality-sim/types';

function makeQuest(ev: OrchestratedEvent): Quest {
  const title = `Mitigate ${ev.type.replace('_',' ')} (${ev.severity})`;
  const description = `Respond to ${ev.type} across ${ev.tiles.length} hot tiles. Deploy resources and stabilize traffic.`;
  const deadline = new Date(Date.now()+30*60*1000).toISOString();
  const rewardXp = 40 + ev.severity*10;
  return {
    _id: '',
    title, description,
    targetTiles: ev.tiles.slice(0,3),
    deadline, rewardXp, status: 'active',
      steps: [
        'Assess the hotspot tiles',
        'Deploy temporary routing',
        'Verify stabilization and report'
      ],
      estimatedMinutes: 15 + (ev.severity*5)
  };
}

async function main() {
  const db = await mongo();
  await subscribe('world.event', async (ev: OrchestratedEvent) => { metricCounter.inc();
    const quest = makeQuest(ev);
    const { insertedId } = await db.collection('quests').insertOne({
      ...quest, createdAt: new Date().toISOString()
    } as any);
    const saved = { ...quest, _id: String(insertedId) };
    await publish('quest.generated', { quest: saved, at: new Date().toISOString() });
  });
  console.log('[quest-ai] listening world.event; generating quests');
}
main().catch((e)=>{ console.error(e); process.exit(1); });


import http from 'http';
const PORT = Number(process.env.PORT || 8081);
http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.url === '/metrics') { res.writeHead(200, { 'content-type': registry.contentType }); return registry.metrics().then(m => res.end(m)); }
  res.writeHead(404); res.end();
}).listen(PORT, () => console.log(`[health] listening on ${PORT}`));
