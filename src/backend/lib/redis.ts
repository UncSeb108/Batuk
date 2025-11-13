import { Redis } from '@upstash/redis'

// For Upstash Redis (recommended for production)
export const redis = new Redis({
  url: process.env.REDIS_URL!,
  token: process.env.REDIS_TOKEN!,
})

// OR for local Redis
// import { createClient } from 'redis'
// export const redis = createClient({
//   url: process.env.REDIS_URL || 'redis://localhost:6379'
// })
// await redis.connect()