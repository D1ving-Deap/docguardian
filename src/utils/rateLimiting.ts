// Rate limiting utility for preventing abuse

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (identifier: string) => string;
}

export interface RateLimitRecord {
  count: number;
  resetTime: number;
  blockedUntil?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// In-memory rate limiter (for client-side protection)
class RateLimiter {
  protected limits = new Map<string, RateLimitRecord>();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
  }

  // Clean up expired records
  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.limits.entries()) {
      if (now > record.resetTime && (!record.blockedUntil || now > record.blockedUntil)) {
        this.limits.delete(key);
      }
    }
  }

  // Check if request is allowed
  check(identifier: string): RateLimitResult {
    this.cleanup();
    
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const now = Date.now();
    const record = this.limits.get(key);

    // If no record exists, create one
    if (!record) {
      const newRecord: RateLimitRecord = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      this.limits.set(key, newRecord);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: newRecord.resetTime
      };
    }

    // Check if currently blocked
    if (record.blockedUntil && now < record.blockedUntil) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.blockedUntil - now) / 1000)
      };
    }

    // Check if window has reset
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + this.config.windowMs;
      record.blockedUntil = undefined;
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: record.resetTime
      };
    }

    // Check if limit exceeded
    if (record.count >= this.config.maxRequests) {
      // Block for the remaining window time
      record.blockedUntil = record.resetTime;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      };
    }

    // Increment count
    record.count++;
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.count,
      resetTime: record.resetTime
    };
  }

  // Reset rate limit for an identifier
  reset(identifier: string): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    this.limits.delete(key);
  }

  // Get current status
  getStatus(identifier: string): RateLimitResult | null {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const record = this.limits.get(key);
    
    if (!record) {
      return null;
    }

    const now = Date.now();
    
    if (now > record.resetTime) {
      return null; // Expired
    }

    return {
      allowed: record.count < this.config.maxRequests && (!record.blockedUntil || now > record.blockedUntil),
      remaining: Math.max(0, this.config.maxRequests - record.count),
      resetTime: record.resetTime,
      retryAfter: record.blockedUntil && now < record.blockedUntil 
        ? Math.ceil((record.blockedUntil - now) / 1000) 
        : undefined
    };
  }
}

// Pre-configured rate limiters
export const authRateLimiter = new RateLimiter({
  maxRequests: 5, // 5 attempts
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyGenerator: (identifier) => `auth:${identifier}`
});

export const fileUploadRateLimiter = new RateLimiter({
  maxRequests: 10, // 10 uploads
  windowMs: 60 * 60 * 1000, // 1 hour
  keyGenerator: (identifier) => `upload:${identifier}`
});

export const apiRateLimiter = new RateLimiter({
  maxRequests: 100, // 100 requests
  windowMs: 60 * 1000, // 1 minute
  keyGenerator: (identifier) => `api:${identifier}`
});

// Utility functions for common rate limiting scenarios
export const checkAuthRateLimit = (email: string): RateLimitResult => {
  return authRateLimiter.check(email);
};

export const checkFileUploadRateLimit = (userId: string): RateLimitResult => {
  return fileUploadRateLimiter.check(userId);
};

export const checkApiRateLimit = (userId: string): RateLimitResult => {
  return apiRateLimiter.check(userId);
};

// Rate limit decorator for functions
export const withRateLimit = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  rateLimiter: RateLimiter,
  identifier: string
) => {
  return async (...args: T): Promise<R> => {
    const result = rateLimiter.check(identifier);
    
    if (!result.allowed) {
      throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
    }
    
    return fn(...args);
  };
};

// Rate limit hook for React components
export const useRateLimit = (rateLimiter: RateLimiter, identifier: string) => {
  const checkLimit = () => rateLimiter.check(identifier);
  const resetLimit = () => rateLimiter.reset(identifier);
  const getStatus = () => rateLimiter.getStatus(identifier);
  
  return { checkLimit, resetLimit, getStatus };
};

// Rate limit middleware for API calls
export const createRateLimitMiddleware = (rateLimiter: RateLimiter, identifier: string) => {
  return async (request: () => Promise<any>): Promise<any> => {
    const result = rateLimiter.check(identifier);
    
    if (!result.allowed) {
      const error = new Error(`Rate limit exceeded. Try again in ${result.retryAfter} seconds.`);
      (error as any).code = 'RATE_LIMIT_EXCEEDED';
      (error as any).retryAfter = result.retryAfter;
      throw error;
    }
    
    return request();
  };
};

// Storage-based rate limiter for persistence across page reloads
export class PersistentRateLimiter extends RateLimiter {
  private storageKey: string;

  constructor(config: RateLimitConfig, storageKey: string) {
    super(config);
    this.storageKey = storageKey;
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired records
        for (const [key, record] of Object.entries(data)) {
          if (now < (record as RateLimitRecord).resetTime) {
            this.limits.set(key, record as RateLimitRecord);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load rate limit data from storage:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data: Record<string, RateLimitRecord> = {};
      for (const [key, record] of this.limits.entries()) {
        data[key] = record;
      }
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save rate limit data to storage:', error);
    }
  }

  check(identifier: string): RateLimitResult {
    const result = super.check(identifier);
    this.saveToStorage();
    return result;
  }

  reset(identifier: string): void {
    super.reset(identifier);
    this.saveToStorage();
  }
}

// Persistent rate limiters
export const persistentAuthRateLimiter = new PersistentRateLimiter(
  {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000,
    keyGenerator: (identifier) => `auth:${identifier}`
  },
  'rate-limit-auth'
);

export const persistentFileUploadRateLimiter = new PersistentRateLimiter(
  {
    maxRequests: 10,
    windowMs: 60 * 60 * 1000,
    keyGenerator: (identifier) => `upload:${identifier}`
  },
  'rate-limit-upload'
); 