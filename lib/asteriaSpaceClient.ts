import { createClient, type Session, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const isBackendConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isBackendConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

export type SpaceRole = 'customer' | 'staff';

export type SpaceAccount = {
  user_id: string;
  username: string;
  role: SpaceRole;
  label: string;
  contact_email: string | null;
};

export type SpaceProfile = {
  id: string;
  display_name: string;
  self_name: string | null;
  phone_number: string | null;
  whatsapp: string | null;
  ig_handle: string | null;
  telegram_handle: string | null;
  contact_email: string | null;
};

export type SpaceThread = {
  id: string;
  customer_id: string;
  status: 'open' | 'closed';
  last_message_at: string;
};

export type SpaceMessage = {
  id: string;
  thread_id: string;
  customer_id: string;
  sender_id: string;
  sender_role: 'customer' | 'admin';
  body: string;
  image_urls: string[];
  created_at: string;
};

export type SpaceEntry = {
  id: string;
  customer_id: string;
  entry_type: 'relationship' | 'journal';
  entry_date: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type StaffInboxCustomer = {
  account: SpaceAccount | null;
  profile: SpaceProfile | null;
  thread: SpaceThread;
  messages: SpaceMessage[];
  entries: SpaceEntry[];
};

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase 未設定，請檢查 Netlify 環境變數並重新 deploy。');
  return supabase;
};

const isMissingRelationError = (error: unknown) => {
  return Boolean(error && typeof error === 'object' && 'code' in error && ['42P01', 'PGRST205'].includes(String(error.code)));
};

const apiRequest = async <T>(path: string, payload: Record<string, unknown>): Promise<T> => {
  const client = requireSupabase();
  const { data: sessionData } = await client.auth.getSession();
  const response = await fetch(`/.netlify/functions/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(sessionData.session?.access_token ? { Authorization: `Bearer ${sessionData.session.access_token}` } : {})
    },
    body: JSON.stringify(payload)
  });

  const contentType = response.headers.get('content-type') || '';
  const body = contentType.includes('application/json') ? await response.json().catch(() => ({})) : {};
  if (!response.ok) {
    throw new Error(body.error || 'Asteria Space backend 暫時連接唔到。');
  }
  if (!contentType.includes('application/json')) {
    throw new Error('本地 preview 未開 Netlify Functions，所以 account 管理暫時不能使用。請用正式網站測試，或改用 Netlify dev preview。');
  }
  return body as T;
};

export const loginWithUsername = async (username: string, password: string) => {
  const client = requireSupabase();
  const result = await apiRequest<{ session: Session; account: SpaceAccount }>('space-login', { username, password });
  await client.auth.setSession({
    access_token: result.session.access_token,
    refresh_token: result.session.refresh_token
  });
  return result.account;
};

export const getCurrentAccount = async () => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) return null;

  const { data, error } = await client
    .from('user_accounts')
    .select('user_id, username, role, label, contact_email')
    .eq('user_id', userData.user.id)
    .single();

  if (error) throw error;
  return data as SpaceAccount;
};

export const upsertMyProfile = async (profile: Partial<SpaceProfile>) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const payload = {
    id: userData.user.id,
    ...profile
  };

  const { data, error } = await client
    .from('profiles')
    .upsert(payload)
    .select()
    .single();

  if (error) throw error;
  return data as SpaceProfile;
};

export const getMySpace = async () => {
  return apiRequest<{
    account: SpaceAccount;
    profile: SpaceProfile | null;
    thread: SpaceThread;
    messages: SpaceMessage[];
    entries: SpaceEntry[];
  }>('space-my-space', {});
};

export const getSignedImageMap = async (paths: string[]) => {
  const client = requireSupabase();
  const uniquePaths = [...new Set(paths.filter(Boolean))];
  if (uniquePaths.length === 0) return {} as Record<string, string>;

  const { data, error } = await client.storage.from('space-uploads').createSignedUrls(uniquePaths, 60 * 60);
  if (error) throw error;

  return (data || []).reduce<Record<string, string>>((map, item) => {
    if (item.path && item.signedUrl) map[item.path] = item.signedUrl;
    return map;
  }, {});
};

export const uploadSpaceImages = async (files: FileList | File[], ownerUserId?: string) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const selectedFiles = Array.from(files);
  const paths: string[] = [];

  for (const file of selectedFiles) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const pathOwner = ownerUserId || userData.user.id;
    const path = `${pathOwner}/${Date.now()}-${safeName}`;
    const { error } = await client.storage.from('space-uploads').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    paths.push(path);
  }

  return paths;
};

export const sendMyMessage = async (threadId: string, body: string, imagePaths: string[]) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const { data, error } = await client
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      customer_id: userData.user.id,
      sender_id: userData.user.id,
      sender_role: 'customer',
      body,
      image_urls: imagePaths
    })
    .select()
    .single();

  if (error) throw error;
  return data as SpaceMessage;
};

export const listStaffInbox = async () => {
  const result = await apiRequest<{ inbox: StaffInboxCustomer[] }>('space-list-inbox', {});
  return result.inbox;
};

export const createSpaceEntry = async (payload: {
  entryType: 'relationship' | 'journal';
  entryDate: string;
  title?: string;
  body: string;
}) => {
  const result = await apiRequest<{ entry: SpaceEntry }>('space-create-entry', payload);
  return result.entry;
};

export const updateSpaceEntry = async (entryId: string, payload: { entryDate?: string; title?: string; body: string }) => {
  const result = await apiRequest<{ entry: SpaceEntry }>('space-update-entry', { entryId, ...payload });
  return result.entry;
};

export const deleteSpaceEntry = async (entryId: string) => {
  return apiRequest<{ ok: boolean }>('space-delete-entry', { entryId });
};

export const listStaffAccounts = async () => {
  const result = await apiRequest<{ accounts: SpaceAccount[] }>('space-list-accounts', {});
  return result.accounts;
};

export const staffSendMessage = async (threadId: string, customerId: string, body: string, imagePaths: string[]) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const { data, error } = await client
    .from('chat_messages')
    .insert({
      thread_id: threadId,
      customer_id: customerId,
      sender_id: userData.user.id,
      sender_role: 'admin',
      body,
      image_urls: imagePaths
    })
    .select()
    .single();

  if (error) throw error;
  return data as SpaceMessage;
};

export const staffCreateAccount = (payload: {
  username: string;
  password: string;
  label: string;
  contactEmail?: string;
  role: SpaceRole;
}) => apiRequest<{ account: SpaceAccount; repaired?: boolean }>('space-create-account', payload);

export const staffResetPassword = (payload: { username: string; password: string }) =>
  apiRequest<{ ok: boolean }>('space-reset-password', payload);

export const staffDeleteAccount = (payload: { username: string }) =>
  apiRequest<{ ok: boolean }>('space-delete-account', payload);

export const changeMyPassword = async (oldPassword: string, newPassword: string) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const { data: account, error: accountError } = await client
    .from('user_accounts')
    .select('auth_email')
    .eq('user_id', userData.user.id)
    .single();

  if (accountError || !account?.auth_email) throw new Error('暫時搵唔到你的 account。');

  const loginCheck = await client.auth.signInWithPassword({
    email: account.auth_email,
    password: oldPassword
  });
  if (loginCheck.error) throw new Error('舊密碼不正確。');

  const { error: updateError } = await client.auth.updateUser({ password: newPassword });
  if (updateError) throw updateError;

  return { ok: true };
};

export const signOutSpace = async () => {
  if (supabase) await supabase.auth.signOut();
};
