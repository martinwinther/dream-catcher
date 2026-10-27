import rateLimit from 'express-rate-limit';

// General limit for all API routes, per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.', type: 'rate_limit' }
});

// Stricter limit for creating dreams, since each one calls the AI API
export const createDreamLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'You have submitted too many dreams. Please wait a few minutes and try again.', type: 'rate_limit' }
});
