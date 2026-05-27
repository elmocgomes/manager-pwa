// Typed client for the admin-portal edge function.
//
// Every call carries the signed-in user's Supabase access token as a bearer
// credential. The edge function verifies it and checks user_profiles.is_admin,
// so privileged work (invites, webhook management, sync, rates) stays
// server-side — the browser only ever holds the session JWT.

import { supabase } from './supabase';

const BASE = `${import.meta.env.VITE_SUPABASE_URL.replace(/\/$/, '')}/functions/v1/admin-portal`;

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error('Not signed in');
  return { Authorization: `Bearer ${token}` };
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const headers: Record<string, string> = { ...(await authHeader()) };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let parsed: unknown = undefined;
  try { parsed = text ? JSON.parse(text) : undefined; } catch { /* non-JSON */ }
  if (!res.ok) {
    const msg = (parsed as { error?: string })?.error
      ?? (res.status === 403 ? 'Not authorized (admin only)' : `HTTP ${res.status}`);
    throw new Error(msg);
  }
  return parsed as T;
}

// ── Types ───────────────────────────────────────────────────────────────────
export type AdminRestaurant = {
  id: string; slug: string; name: string;
  total_seats: number | null; open_hours: number | null;
  active: boolean; source_pos: string;
};
export type AdminTarget = { business_date: string; target_revenue: number; notes: string | null };
export type SyncStatus = {
  last_sync_per_restaurant: Array<{ slug: string; name: string; last_synced_at: string | null }>;
  recent_events: Array<{ action: string | null; entity_id: string | null; received_at: string | null; processed_at: string | null; error: string | null }>;
  cron_active: boolean;
  cron_schedule: string | null;
};
export type AdminWebhook = { id: string; url: string; actions: string[]; enabled: boolean };
export type AdminEmployee = {
  id: string; first_name: string; last_name: string;
  pos_name: string | null; role: string | null;
  fresto_uid: string | null; planday_employee_id: number | null;
};
export type ProductGroup = {
  id: string; name: string;
  category: 'drinks' | 'food' | 'ignore' | null;
  needs_review: boolean;
};
export type EmployeeGroupRate = {
  restaurant_id: string; planday_employee_group_id: number;
  group_name: string | null; hourly_rate_dkk: number;
};
export type AdminUser = { id: string; full_name: string; is_admin: boolean; restaurants: string[] };

// ── Endpoints ─────────────────────────────────────────────────────────────
export const adminApi = {
  // Restaurants
  listRestaurants: () => request<{ results: AdminRestaurant[] }>('GET', '/api/restaurants').then(r => r.results),
  patchRestaurant: (slug: string, patch: Partial<Pick<AdminRestaurant, 'name' | 'total_seats' | 'open_hours' | 'active'>>) =>
    request<{ ok: true }>('PATCH', `/api/restaurants/${encodeURIComponent(slug)}`, patch),

  // Targets
  listTargets: (slug: string, from: string, to: string) =>
    request<{ results: AdminTarget[] }>('GET', `/api/targets?restaurant=${encodeURIComponent(slug)}&from=${from}&to=${to}`).then(r => r.results),
  saveTargets: (restaurant_slug: string, targets: Array<{ business_date: string; target_revenue: number; notes: string }>) =>
    request<{ upserted: number }>('POST', '/api/targets', { restaurant_slug, targets }),

  // Sync
  syncStatus: () => request<SyncStatus>('GET', '/api/sync/status'),
  runSync: () => request<{ ok: true; started_at: string }>('POST', '/api/sync/run'),
  setCron: (enable: boolean) =>
    request<{ cron_active: boolean }>('POST', enable ? '/api/sync/cron/enable' : '/api/sync/cron/disable'),

  // Webhooks
  listWebhooks: () => request<{ results: AdminWebhook[] }>('GET', '/api/webhooks').then(r => r.results),
  registerWebhook: (url: string) => request<{ ok: true; registered: string[] }>('POST', '/api/webhooks/register', { url }),
  deleteWebhook: (id: string) => request<{ ok: true }>('DELETE', `/api/webhooks/${encodeURIComponent(id)}`),

  // Employees
  listEmployees: (slug: string) =>
    request<{ results: AdminEmployee[] }>('GET', `/api/employees?restaurant=${encodeURIComponent(slug)}`).then(r => r.results),
  setEmployeePlandayId: (id: string, planday_employee_id: number | null) =>
    request<{ ok: true }>('PATCH', `/api/employees/${encodeURIComponent(id)}`, { planday_employee_id }),

  // Product groups → categories
  listProductGroups: (slug: string) =>
    request<{ results: ProductGroup[] }>('GET', `/api/product-groups?restaurant=${encodeURIComponent(slug)}`).then(r => r.results),
  setProductGroupCategory: (id: string, category: 'drinks' | 'food' | 'ignore') =>
    request<{ ok: true }>('PATCH', `/api/product-group-categories/${encodeURIComponent(id)}`, { category }),

  // Employee group hourly rates
  listRates: (slug: string) =>
    request<{ results: EmployeeGroupRate[] }>('GET', `/api/employee-group-rates?restaurant=${encodeURIComponent(slug)}`).then(r => r.results),
  setRate: (restaurant_slug: string, planday_employee_group_id: number, hourly_rate_dkk: number) =>
    request<{ ok: true }>('PATCH', '/api/employee-group-rates', { restaurant_slug, planday_employee_group_id, hourly_rate_dkk }),

  // Users
  listUsers: () => request<{ results: AdminUser[] }>('GET', '/api/users').then(r => r.results),
  inviteUser: (email: string, full_name: string, restaurants: string[]) =>
    request<{ ok: true; user_id: string }>('POST', '/api/users/invite', { email, full_name, restaurants }),
  setUserRestaurants: (userId: string, restaurants: string[]) =>
    request<{ ok: true }>('PATCH', `/api/users/${encodeURIComponent(userId)}/restaurants`, { restaurants }),
};
