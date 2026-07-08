import { RateLimiterMemory } from "rate-limiter-flexible";

export const aiRateLimiter = new RateLimiterMemory({
  points: 5,        // 5 requests
  duration: 60 * 60, // per 1 hour
});