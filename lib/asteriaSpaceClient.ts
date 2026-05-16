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

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase 未設定，依家會繼續用本地 demo。');
  return supabase;
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

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body.error || 'Asteria Space backend 暫時連接唔到。');
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
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');
  const userId = userData.user.id;

  const [accountResult, profileResult, threadResult] = await Promise.all([
    client.from('user_accounts').select('user_id, username, role, label, contact_email').eq('user_id', userId).single(),
    client.from('profiles').select('*').eq('id', userId).maybeSingle(),
    client.from('message_threads').select('*').eq('customer_id', userId).maybeSingle()
  ]);

  if (accountResult.error) throw accountResult.error;
  if (profileResult.error) throw profileResult.error;
  if (threadResult.error) throw threadResult.error;

  let thread = threadResult.data as SpaceThread | null;
  if (!thread) {
    const created = await client
      .from('message_threads')
      .insert({ customer_id: userId })
      .select()
      .single();
    if (created.error) throw created.error;
    thread = created.data as SpaceThread;
  }

  const { data: messages, error: messagesError } = await client
    .from('chat_messages')
    .select('*')
    .eq('thread_id', thread.id)
    .order('created_at', { ascending: true });

  if (messagesError) throw messagesError;

  return {
    account: accountResult.data as SpaceAccount,
    profile: profileResult.data as SpaceProfile | null,
    thread,
    messages: (messages || []) as SpaceMessage[]
  };
};

export const uploadSpaceImages = async (files: FileList | File[]) => {
  const client = requireSupabase();
  const { data: userData, error: userError } = await client.auth.getUser();
  if (userError || !userData.user) throw new Error('請先登入。');

  const selectedFiles = Array.from(files);
  const paths: string[] = [];

  for (const file of selectedFiles) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-');
    const path = `${userData.user.id}/${Date.now()}-${safeName}`;
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

export const staffCreateAccount = (payload: {
  username: string;
  password: string;
  label: string;
  contactEmail?: string;
  role: SpaceRole;
}) => apiRequest<{ account: SpaceAccount }>('space-create-account', payload);

export const staffResetPassword = (payload: { username: string; password: string }) =>
  apiRequest<{ ok: boolean }>('space-reset-password', payload);

export const staffDeleteAccount = (payload: { username: string }) =>
  apiRequest<{ ok: boolean }>('space-delete-account', payload);

export const signOutSpace = async () => {
  if (supabase) await supabase.auth.signOut();
};
