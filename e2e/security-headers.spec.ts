import { test, expect } from '@playwright/test';

test.describe('Security Headers', () => {
  test('page responses include security headers', async ({ request }) => {
    const response = await request.get('/');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-xss-protection']).toBe('1; mode=block');
  });

  test('API responses include security headers', async ({ request }) => {
    const response = await request.get('/api/todos');
    expect(response.headers()['x-content-type-options']).toBe('nosniff');
    expect(response.headers()['x-frame-options']).toBe('DENY');
    expect(response.headers()['x-xss-protection']).toBe('1; mode=block');
  });
});
