import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import promClient from 'prom-client';
import { cfg } from '@config/reality-sim';
import { mongo } from '@db/reality-sim';
import { publish } from '@messaging/reality-sim';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { issueTokens, rotateRefresh, revokeRefresh } from './auth.js';

// Types used locally for DB shape
type Vec2 = { x:number; y:number };
interface Quest { _id: any; title:string; description:string; targetTiles:Vec2[]; deadline:string; rewardXp:number; status:'active'|'completed'|'expired'; createdAt:string }
interface QuestProgress { userId:string; questId:string; acceptedAt?:string; completedAt?:string; rewardClaimed?:boolean }

const app = express();
app.use(helmet());
app.use(cors({ origin: '*' }));
app.use(express.json());

// Rate limit
const windowMs = Number(cfg.RATE_LIMIT_WINDOW_MS || 60000);
const maxReq = Number(cfg.RATE_LIMIT_MAX || 300);
app.use(rateLimit({ windowMs, limit: maxReq }));

// Metrics
const registry = new promClient.Registry();
promClient.collectDefaultMetrics({ register: registry });
app.get('/metrics', async (_req, res) => { res.set('Content-Type', registry.contentType); res.end(await registry.metrics()); });

app.get('/health', (_req, res) => res.json({ ok: true, env: cfg.NODE_ENV }));

function authRequired(req: express.Request, res: express.Response, next: express.NextFunction) {
  const h = req.header('authorization') || req.header('Authorization');
  if (!h || !h.startsWith('Bearer ')) return res.status(401).json({ error: 'missing token' });
  const token = h.slice(7);
  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET) as JwtPayload;
    (req as any).userId = decoded.sub;
    (req as any).email = decoded.email;
    return next();
  } catch {
    return res.status(401).json({ error: 'invalid token' });
  }
}

// ---- Auth routes ----
const regSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string().min(2).max(40)
});

app.post('/auth/register', async (req, res) => {
  const body = regSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'invalid input', details: body.error.flatten() });
  const { email, password, displayName } = body.data;
  const db = await mongo();
  const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ error: 'email taken' });
  const hash = await bcrypt.hash(password, 10);
  const doc = { email: email.toLowerCase(), displayName, hash, roles: ['user'], createdAt: new Date().toISOString(), xp: 0, level: 1 };
  const { insertedId } = await db.collection('users').insertOne(doc as any);
  const tokens = await issueTokens(String(insertedId), email.toLowerCase());
  res.json({ user: { id: String(insertedId), email, displayName }, tokens });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

app.post('/auth/login', async (req, res) => {
  const body = loginSchema.safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: 'invalid input' });
  const { email, password } = body.data;
  const db = await mongo();
  const u = await db.collection('users').findOne({ email: email.toLowerCase() });
  if (!u) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await bcrypt.compare(password, (u as any).hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const tokens = await issueTokens(String((u as any)._id), email.toLowerCase());
  res.json({ user: { id: String((u as any)._id), email: (u as any).email, displayName: (u as any).displayName }, tokens });
});

app.post('/auth/refresh', async (req, res) => {
  const { refresh } = req.body || {};
  if (!refresh) return res.status(400).json({ error: 'Missing refresh' });
  try {
    const rotated = await rotateRefresh(refresh);
    return res.json(rotated);
  } catch {
    return res.status(401).json({ error: 'Invalid/Revoked refresh' });
  }
});

app.post('/auth/logout', async (req, res) => {
  const refresh = (req.body && req.body.refresh) || '';
  if (refresh) await revokeRefresh(refresh);
  res.json({ ok: true });
});

// ---- Seed demo quests if empty ----
async function ensureSeed() {
  const db = await mongo();
  const count = await db.collection('quests').countDocuments();
  if (count === 0) {
    const now = Date.now();
    await db.collection('quests').insertMany([
      { title: 'Traffic Control — Sector 3', description: 'Reduce congestion by rerouting flows around hotspots.', targetTiles: [{x:11,y:7},{x:12,y:8},{x:12,y:9}], deadline: new Date(now + 30*60*1000).toISOString(), rewardXp: 50, status: 'active', createdAt: new Date().toISOString() },
      { title: 'Air Quality Sweep', description: 'Deploy sensors in three tiles to assess pollution.', targetTiles: [{x:20,y:14},{x:21,y:14},{x:21,y:15}], deadline: new Date(now + 50*60*1000).toISOString(), rewardXp: 70, status: 'active', createdAt: new Date().toISOString() }
    ] as any[]);
  }
}
ensureSeed().catch(()=>{});

// ---- Protected routes ----
app.get('/quests', authRequired, async (_req, res) => {
  const db = await mongo();
  const items = await db.collection<Quest>('quests').find({ status: 'active' }).sort({ createdAt: -1 }).limit(50).toArray();
  res.json({ items });
});

app.post('/quests/accept/:id', authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const questId = req.params.id;
  const db = await mongo();
  const oid = ObjectId.isValid(questId) ? new ObjectId(questId) : null;
  const q = await db.collection<Quest>('quests').findOne(oid ? { _id: oid } as any : { _id: questId as any } as any);
  if (!q) return res.status(404).json({ error: 'Quest not found' });
  const now = new Date().toISOString();
  await db.collection<QuestProgress>('quest_progress').updateOne(
    { userId, questId: (q as any)._id.toString() },
    { $setOnInsert: { userId, questId: (q as any)._id.toString(), acceptedAt: now, rewardClaimed: false } },
    { upsert: true }
  );
  res.json({ ok: true, questId: (q as any)._id.toString(), acceptedAt: now });
});

app.post('/quests/complete/:id', authRequired, async (req, res) => {
  const userId = (req as any).userId as string;
  const questId = req.params.id;
  const db = await mongo();
  const oid2 = ObjectId.isValid(questId) ? new ObjectId(questId) : null;
  const q = await db.collection<Quest>('quests').findOne(oid2 ? { _id: oid2 } as any : { _id: questId as any } as any);
  if (!q) return res.status(404).json({ error: 'Quest not found' });
  const now = new Date().toISOString();
  await db.collection<QuestProgress>('quest_progress').updateOne(
    { userId, questId: (q as any)._id.toString() },
    { $set: { completedAt: now } },
    { upsert: true }
  );
  await publish('quest.completed', { questId: (q as any)._id.toString(), userId, rewardXp: (q as any).rewardXp, at: now });
  res.json({ ok: true, questId: (q as any)._id.toString(), completedAt: now, rewardXp: (q as any).rewardXp });
});

app.get('/leaderboard', async (_req,res) => {
  const db = await mongo();
  const items = await db.collection('users').find({}, { projection: { _id: 0, userId: 1, xp: 1, level: 1 } } as any).sort({ xp: -1 }).limit(10).toArray();
  res.json({ items });
});

app.listen(cfg.PORT, () => {
  console.log(`[gateway] listening on http://localhost:${cfg.PORT}`);
});
