// @ts-nocheck
import jwt from 'jsonwebtoken';

const store = new Map<string, { value: string; ttl: number }>();

const redisMock = {
  set: jest.fn(async (key: string, value: string, opts: any) => {
    store.set(key, { value, ttl: opts?.EX });
  }),
  get: jest.fn(async (key: string) => store.get(key)?.value ?? null),
  del: jest.fn(async (key: string) => {
    store.delete(key);
  })
};

jest.mock('@db/reality-sim', () => ({
  redis: async () => redisMock
}), { virtual: true });

jest.mock('@config/reality-sim', () => ({
  cfg: { JWT_SECRET: 'test-secret' }
}), { virtual: true });

process.env.JWT_SECRET = 'test-secret';
process.env.MONGO_URI = 'mongodb://localhost:27017/test';

let issueTokens: any;
let rotateRefresh: any;

beforeAll(async () => {
  ({ issueTokens, rotateRefresh } = await import('../src/auth'));
});

const REFRESH_TTL_SEC = 60 * 60 * 24 * 30;

describe('auth token helpers', () => {
  beforeEach(() => {
    store.clear();
    jest.clearAllMocks();
  });

  test('issueTokens stores refresh token with TTL', async () => {
    const { refresh } = await issueTokens('user1', 'u@example.com');
    const decoded: any = jwt.decode(refresh);
    const entry = store.get(`refresh:${decoded.jti}`);
    expect(entry).toBeDefined();
    expect(entry?.value).toBe('user1');
    expect(entry?.ttl).toBe(REFRESH_TTL_SEC);
  });

  test('rotateRefresh invalidates old token and stores new refresh', async () => {
    const { refresh: oldRefresh } = await issueTokens('user1', 'u@example.com');
    const oldJti = (jwt.decode(oldRefresh) as any).jti;
    const tokens = await rotateRefresh(oldRefresh);
    const newJti = (jwt.decode(tokens.refresh) as any).jti;
    expect(store.get(`refresh:${oldJti}`)).toBeUndefined();
    expect(store.get(`refresh:${newJti}`)?.value).toBe('user1');
  });

  test('rotateRefresh rejects revoked token', async () => {
    const { refresh } = await issueTokens('user1', 'u@example.com');
    const jti = (jwt.decode(refresh) as any).jti;
    store.delete(`refresh:${jti}`);
    await expect(rotateRefresh(refresh)).rejects.toThrow('invalid refresh');
  });
});

