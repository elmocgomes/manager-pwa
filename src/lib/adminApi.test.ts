import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';

// Mock the supabase client so importing adminApi doesn't pull in the real one
// (which throws if env vars are missing) and so we control the session token.
const getSession = vi.fn();
vi.mock('./supabase', () => ({ supabase: { auth: { getSession: () => getSession() } } }));

let adminApi: typeof import('./adminApi').adminApi;
const fetchMock = vi.fn();

beforeAll(async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://proj.supabase.co');
  vi.stubGlobal('fetch', fetchMock);
  ({ adminApi } = await import('./adminApi'));
});
afterAll(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function okJson(body: unknown) {
  return { ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(body)) } as Response;
}

beforeEach(() => {
  getSession.mockReset();
  fetchMock.mockReset();
  getSession.mockResolvedValue({ data: { session: { access_token: 'jwt-123' } } });
});

describe('adminApi', () => {
  it('sends the session token as a Bearer credential to the admin-portal function', async () => {
    fetchMock.mockResolvedValue(okJson({ results: [] }));
    await adminApi.listRestaurants();
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://proj.supabase.co/functions/v1/admin-portal/api/restaurants');
    expect(init.method).toBe('GET');
    expect(init.headers.Authorization).toBe('Bearer jwt-123');
  });

  it('unwraps the results array', async () => {
    fetchMock.mockResolvedValue(okJson({ results: [{ slug: 'cholon' }] }));
    const rows = await adminApi.listRestaurants();
    expect(rows[0].slug).toBe('cholon');
  });

  it('sends a JSON body with Content-Type on writes', async () => {
    fetchMock.mockResolvedValue(okJson({ upserted: 1 }));
    await adminApi.saveTargets('cholon', [{ business_date: '2026-05-27', target_revenue: 50000, notes: '' }]);
    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe('POST');
    expect(init.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(init.body).restaurant_slug).toBe('cholon');
  });

  it('throws a friendly message on 403 (non-admin)', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 403, text: () => Promise.resolve('Forbidden') } as Response);
    await expect(adminApi.listUsers()).rejects.toThrow(/admin only/i);
  });

  it('surfaces the API error message when present', async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500, text: () => Promise.resolve(JSON.stringify({ error: 'boom' })) } as Response);
    await expect(adminApi.listWebhooks()).rejects.toThrow('boom');
  });

  it('refuses to call out when there is no session', async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    await expect(adminApi.listRestaurants()).rejects.toThrow(/not signed in/i);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
