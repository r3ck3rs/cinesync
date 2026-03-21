/**
 * Tests for /api/screenings rate limiting
 * We test the rate limit logic directly (not the full HTTP layer)
 */

// Rebuild the rate limiter logic inline for unit testing
const RATE_LIMIT = 30;
const WINDOW_MS = 60_000;

function buildLimiter() {
  const map = new Map<string, { count: number; resetAt: number }>();

  return function checkRateLimit(ip: string, now = Date.now()): boolean {
    const entry = map.get(ip);
    if (!entry || now > entry.resetAt) {
      map.set(ip, { count: 1, resetAt: now + WINDOW_MS });
      return true;
    }
    if (entry.count >= RATE_LIMIT) return false;
    entry.count++;
    return true;
  };
}

describe('/api/screenings rate limiter', () => {
  it('allows up to RATE_LIMIT requests per window', () => {
    const check = buildLimiter();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) {
      expect(check('1.2.3.4', now)).toBe(true);
    }
    expect(check('1.2.3.4', now)).toBe(false);
  });

  it('resets after the window expires', () => {
    const check = buildLimiter();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) check('5.6.7.8', now);
    expect(check('5.6.7.8', now)).toBe(false);
    // After window expires
    expect(check('5.6.7.8', now + WINDOW_MS + 1)).toBe(true);
  });

  it('tracks different IPs independently', () => {
    const check = buildLimiter();
    const now = Date.now();
    for (let i = 0; i < RATE_LIMIT; i++) check('a.a.a.a', now);
    expect(check('a.a.a.a', now)).toBe(false);
    expect(check('b.b.b.b', now)).toBe(true);
  });
});
