import { config as dotenv } from 'dotenv';
import { z } from 'zod';
dotenv();

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(8080),
  JWT_SECRET: z.string(),
  MONGO_URI: z.string(),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  RABBIT_URL: z.string().default('amqp://guest:guest@localhost:5672'),
  OPENAI_API_KEY: z.string().optional(),
  ALLOWED_ORIGINS: z.string().optional(),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().optional(),
  RATE_LIMIT_MAX: z.coerce.number().optional(),
  APPLE_BUNDLE_ID: z.string().optional(),
  MS_CLIENT_ID: z.string().optional(),
  GRID_ID: z.string().default('cityA:40x40')
});

export const cfg = schema.parse(process.env);
