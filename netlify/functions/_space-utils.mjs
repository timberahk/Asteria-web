import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const rateLimitBuckets = new Map();

export const json = (statusCode, body) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store'
  },
  body: JSON.stringify(body)
});

export const assertEnv = () => {
  if (!supabaseUrl || !supabaseAnonKey || !serviceRoleKey) {
    throw new Error('Supabase env vars 未設定完整。');
  }
};

export const getAdminClient = () => {
  assertEnv();
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const getAnonClient = () => {
  assertEnv();
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const parseBody = (event) => {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch {
    const error = new Error('Request 格式錯誤。');
    error.statusCode = 400;
    throw error;
  }
};

const httpError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const normalizeUsername = (value) => String(value || '').trim().toLowerCase();

export const getClientIp = (event) => {
  const forwardedFor = event.headers['x-forwarded-for'] || event.headers['X-Forwarded-For'] || '';
  return String(forwardedFor).split(',')[0].trim() || event.headers['client-ip'] || 'unknown';
};

export const assertRateLimit = ({ key, limit = 8, windowMs = 15 * 60 * 1000 }) => {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    const waitMinutes = Math.max(1, Math.ceil((bucket.resetAt - now) / 60000));
    const error = new Error(`登入嘗試太多，請 ${waitMinutes} 分鐘後再試。`);
    error.statusCode = 429;
    throw error;
  }
};

export const makeAuthEmail = (username) => {
  const safe = normalizeUsername(username).replace(/[^a-z0-9._-]/g, '-');
  if (!safe || safe.length < 3) throw new Error('Account 名最少 3 個字。');
  return `${safe}@accounts.asteria-space.local`;
};

export const getBearerToken = (event) => {
  const header = event.headers.authorization || event.headers.Authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
};

export const requireAdmin = async (event) => {
  const token = getBearerToken(event);
  if (!token) throw httpError(401, '請先以 staff 登入。');

  const admin = getAdminClient();
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) throw httpError(401, '登入已過期，請重新登入。');

  const { data, error } = await admin
    .from('admin_users')
    .select('user_id')
    .eq('user_id', userData.user.id)
    .single();

  if (error || !data) throw httpError(403, '只有 staff 可以做呢個操作。');
  return { admin, user: userData.user };
};

export const logAudit = async (admin, actorId, targetUserId, action, payload = {}) => {
  await admin.from('account_audit_events').insert({
    actor_id: actorId,
    target_user_id: targetUserId,
    action,
    payload
  });
};
