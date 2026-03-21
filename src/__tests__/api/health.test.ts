/**
 * Tests for /api/health endpoint
 */

// Mock NextResponse before importing route
jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

jest.mock('@/lib/screenings', () => ({
  getRotterdamScreenings: jest.fn(),
}));

import { GET } from '@/app/api/health/route';
import { getRotterdamScreenings } from '@/lib/screenings';

describe('/api/health', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns 200 and status ok when scraper works', async () => {
    (getRotterdamScreenings as jest.Mock).mockResolvedValue([
      { id: '1', cinema: 'Test', cinemaSlug: 'test', movieTitle: 'Film', movieSlug: 'film', showtimes: [] },
    ]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.scraper).toBe('ok');
    expect(body.screeningCount).toBe(1);
    expect(body.timestamp).toBeDefined();
  });

  it('returns 503 and status degraded when scraper throws', async () => {
    (getRotterdamScreenings as jest.Mock).mockRejectedValue(new Error('fetch failed'));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(503);
    expect(body.status).toBe('degraded');
    expect(body.scraper).toBe('error');
  });
});
