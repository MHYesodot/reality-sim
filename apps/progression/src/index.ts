import promClient from 'prom-client';
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });
const metricCounter = new promClient.Counter({ name: 'progression_events_total', help: 'Events processed' });
registry.registerMetric(metricCounter);

import { subscribe } from '@messaging/reality-sim';
import { mongo } from '@db/reality-sim';
import { logger } from '@utils/reality-sim';

async function main() {
  const db = await mongo();
  await subscribe('quest.completed', async (msg: any) => { metricCounter.inc();
    const { userId, questId, rewardXp } = msg;
    // increment user xp
    await db.collection('users').updateOne(
      { userId },
      { $inc: { xp: rewardXp }, $setOnInsert: { userId, level: 1, createdAt: new Date().toISOString() } },
      { upsert: true }
    );
    // mark claimed
    await db.collection('quest_progress').updateOne(
      { userId, questId },
      { $set: { rewardClaimed: true } },
      { upsert: true }
    );
    logger.info({ userId, rewardXp }, '[progression] XP updated');
  });
  logger.info('[progression] listening on quest.completed');
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
