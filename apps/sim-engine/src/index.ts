import { publish } from '@messaging/reality-sim';

console.log('[sim-engine] starting ticker → RabbitMQ');
setInterval(() => {
  const deltas = Array.from({ length: 20 }).map((_, i) => ({
    x: Math.floor(Math.random()*40),
    y: Math.floor(Math.random()*40),
    traffic: Math.random()
  }));
  const payload = { tick: Date.now(), deltas, at: new Date().toISOString() };
  publish('sim.tick', payload).catch(()=>{});
}, 2000);


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
