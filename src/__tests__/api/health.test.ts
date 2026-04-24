// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/health/route';

describe('GET /api/health', () => {
  it('returns 200 with status ok and ISO timestamp', async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.status).toBe('ok');
    expect(json.timestamp).toBeDefined();
    // Verify timestamp is valid ISO 8601
    expect(() => new Date(json.timestamp).toISOString()).not.toThrow();
  });

  it('returns a timestamp close to current time', async () => {
    const before = new Date().toISOString();
    const response = await GET();
    const json = await response.json();
    const after = new Date().toISOString();

    expect(json.timestamp >= before).toBe(true);
    expect(json.timestamp <= after).toBe(true);
  });

  it('returns Content-Type application/json', async () => {
    const response = await GET();

    expect(response.headers.get('content-type')).toContain('application/json');
  });
});
