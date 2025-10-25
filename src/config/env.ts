import { z } from 'zod';

// Only list vars you actually use. Optional ones are fine while WIP.
const Schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Client-exposed (Next.js): must start with NEXT_PUBLIC_
  NEXT_PUBLIC_API_BASE: z.string().url().optional(),

  // Temporary/experimental toggles
  EXP_FEATURE_X: z.coerce.boolean().default(false),
  TMP_SOMETHING: z.string().optional(),

  // Drawing tool config
  NEXT_PUBLIC_DEFAULT_COLOR: z.coerce.number().default(0x9f34c2ff),
});

const parsed = Schema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
  EXP_FEATURE_X: process.env.EXP_FEATURE_X,
  TMP_SOMETHING: process.env.TMP_SOMETHING,
});

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  throw new Error('❌ Invalid env');
}

export const env = parsed.data;

// A tiny wrapper so app code never touches process.env:
export const config = {
  apiBase: env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:3000',
  featureXEnabled: env.EXP_FEATURE_X,
  tmpSomething: env.TMP_SOMETHING ?? null, // easy to delete later

  defaultColor: env.NEXT_PUBLIC_DEFAULT_COLOR,
};
