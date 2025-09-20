import { NextRequest } from 'next/server';

// Rate limiting utility
const rateLimit = (() => {
  const requests: { [key: string]: number[] } = {};
  const WINDOW_MS = 60 * 1000; // 1 minute
  const MAX_REQUESTS = 10; // Max 10 requests per minute per IP

  return (identifier: string): boolean => {
    const now = Date.now();
    const userRequests = requests[identifier] || [];
    
    // Remove old requests outside the window
    const recentRequests = userRequests.filter(time => now - time < WINDOW_MS);
    
    if (recentRequests.length >= MAX_REQUESTS) {
      return false; // Rate limited
    }
    
    recentRequests.push(now);
    requests[identifier] = recentRequests;
    return true;
  };
})();

// Get client IP for rate limiting
export const getClientIP = (req: NextRequest): string => {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (realIP) {
    return realIP;
  }
  return 'unknown';
};

// Rate limiting middleware
export const checkRateLimit = (req: NextRequest, identifier?: string): boolean => {
  const clientIP = identifier || getClientIP(req);
  return rateLimit(clientIP);
};

// Input validation
export const validateInput = (input: string, maxLength: number = 5000): { isValid: boolean; error?: string } => {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Invalid input format' };
  }
  
  if (input.length > maxLength) {
    return { isValid: false, error: `Input too long. Maximum ${maxLength} characters allowed.` };
  }
  
  // Check for potential malicious content
  const maliciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi
  ];
  
  for (const pattern of maliciousPatterns) {
    if (pattern.test(input)) {
      return { isValid: false, error: 'Invalid content detected' };
    }
  }
  
  return { isValid: true };
};

// Simple in-memory cache with TTL
class SimpleCache {
  private cache = new Map<string, { data: any; expires: number }>();
  private readonly TTL = 10 * 60 * 1000; // 10 minutes

  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expires: Date.now() + this.TTL
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export const apiCache = new SimpleCache();

// Create cache key from input
export const createCacheKey = (prefix: string, input: string): string => {
  const hash = Array.from(input).reduce((hash, char) => 
    ((hash << 5) - hash + char.charCodeAt(0)) & 0xffffffff, 0
  );
  return `${prefix}:${Math.abs(hash)}`;
};

// Timeout wrapper for API calls
export const withTimeout = <T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    )
  ]);
};
