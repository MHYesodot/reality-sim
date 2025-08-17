import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { cfg } from '@config/reality-sim';
import { redis } from '@db/reality-sim';

const ACCESS_TTL_SEC = 60 * 15; // 15m
const REFRESH_TTL_SEC = 60 * 60 * 24 * 30; // 30d

type JWTPayload = { sub: string; email: string; jti: string };

export async function issueTokens(userId: string, email: string) {
  const jti = uuidv4();
  const access = jwt.sign({ sub: userId, email, jti } as JWTPayload, cfg.JWT_SECRET, { algorithm: 'HS256', expiresIn: ACCESS_TTL_SEC });
  const refresh = jwt.sign({ sub: userId, email, jti } as JWTPayload, cfg.JWT_SECRET, { algorithm: 'HS256', expiresIn: REFRESH_TTL_SEC });
  const r = await redis();
  await r.set(`refresh:${jti}`, userId, { EX: REFRESH_TTL_SEC });
  return { access, refresh };
}

export async function rotateRefresh(oldToken: string) {
  const r = await redis();
  try {
    const decoded = jwt.verify(oldToken, cfg.JWT_SECRET) as JWTPayload;
    const exists = await r.get(`refresh:${decoded.jti}`);
    if (!exists) throw new Error('refresh revoked');
    await r.del(`refresh:${decoded.jti}`);
    return await issueTokens(decoded.sub, decoded.email);
  } catch {
    throw new Error('invalid refresh');
  }
}

export async function revokeRefresh(token: string) {
  const r = await redis();
  try {
    const decoded = jwt.verify(token, cfg.JWT_SECRET) as JWTPayload;
    await r.del(`refresh:${decoded.jti}`);
  } catch {}
}


