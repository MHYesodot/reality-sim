import http, { IncomingMessage, ServerResponse } from 'http';
import promClient from 'prom-client';
import { Server, Socket } from 'socket.io';
import { cfg } from '@config/reality-sim';
import jwt from 'jsonwebtoken';
import { redis } from '@db/reality-sim';
import type { SimTick, OrchestratedEvent, Quest } from '@reality-sim/types';
import { subscribe } from '@messaging/reality-sim';
import process from 'node:process';

// Socket.IO event maps
interface ClientToServerEvents {
  'join': (payload: { room: string }) => void;
  'chat:send': (payload: { room: string; text: string }) => void;
}
interface ServerToClientEvents {
  'world:delta': (payload: { t: 'world:delta'; data: SimTick }) => void;
  'world:event': (payload: { t: 'world:event'; data: OrchestratedEvent }) => void;
  'quest:new': (payload: { t: 'quest:new'; data: Quest }) => void;
  'chat:message': (payload: { room: string; user: string; text: string; at: string }) => void;
}

const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ ok: true }));
  }
  if (req.url === '/metrics') { res.writeHead(200, { 'content-type': registry.contentType }); return registry.metrics().then((m: string) => res.end(m)); }
  res.writeHead(404); res.end();
});
const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, { cors: { origin: '*' } });
// Redis-based per-IP connection rate limiter
io.use(async (socket: Socket<ClientToServerEvents, ServerToClientEvents>, next: (err?: Error) => void)=>{
  try {
    const ip = (socket.handshake.headers['x-forwarded-for'] as string || socket.handshake.address || '').split(',')[0].trim() || 'unknown';
    const r = await redis();
    const key = `wsrate:${ip}:${Math.floor(Date.now()/60000)}`;
    const cnt = await r.incr(key);
    if (cnt === 1) await r.expire(key, 60);
    if (cnt > 60) return next(new Error('rate_limited'));
    return next();
  } catch (e) { return next(new Error('rate_failed')); }
});

io.use((socket: Socket<ClientToServerEvents, ServerToClientEvents>, next: (err?: Error) => void) => {
  try {
    const token = (socket.handshake.auth && (socket.handshake.auth as any).token) || '';
    if (!token) return next(new Error('unauthorized'));
    const data = jwt.verify(String(token).replace(/^Bearer\s+/i, ''), cfg.JWT_SECRET) as any;
    (socket.data as any).userId = data.sub;
    return next();
  } catch (e) { return next(new Error('unauthorized')); }
});

io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents>) => {
  socket.on('join', ({ room }: { room: string }) => socket.join(room));
  socket.on('chat:send', ({ room, text }: { room: string; text: string }) => {
    io.to(room).emit('chat:message', { room, user: 'system', text, at: new Date().toISOString() });
  });
});

// Bridge from RabbitMQ → WS
(async () => {
  await subscribe('sim.tick', async (msg:any) => {
    io.emit('world:delta', { t: 'world:delta', data: msg as SimTick });
  });
  await subscribe('world.event', async (msg:any) => {
    io.emit('world:event', { t: 'world:event', data: msg as OrchestratedEvent });
  });
  await subscribe('quest.generated', async (msg:any) => {
    io.emit('quest:new', { t: 'quest:new', data: (msg as { quest: Quest }).quest });
  });
  console.log('[realtime] bridging RabbitMQ → Socket.IO');
})().catch(e=>{ console.error(e); process.exit(1); });

server.listen(8090, () => console.log(`[realtime] ws://localhost:8090`));
