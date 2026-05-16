import { getAdminClient, getAnonClient, json, normalizeUsername, parseBody } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { username, password } = parseBody(event);
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername || !password) return json(400, { error: '請輸入 account 名同 password。' });

    const admin = getAdminClient();
    let { data: account, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username, auth_email, role, label, contact_email')
      .eq('username', normalizedUsername)
      .maybeSingle();

    if (!account && normalizedUsername.includes('@')) {
      const result = await admin
        .from('user_accounts')
        .select('user_id, username, auth_email, role, label, contact_email')
        .eq('auth_email', normalizedUsername)
        .maybeSingle();
      account = result.data;
      accountError = result.error;
    }

    if (!account && normalizedUsername.includes('@')) {
      const result = await admin
        .from('user_accounts')
        .select('user_id, username, auth_email, role, label, contact_email')
        .eq('contact_email', normalizedUsername)
        .maybeSingle();
      account = result.data;
      accountError = result.error;
    }

    if (accountError || !account) {
      return json(401, { error: '搵唔到呢個 Asteria Space account。請檢查 SQL 有冇 run 最新 bootstrap，或 account 名/email 有冇打錯。' });
    }

    const anon = getAnonClient();
    const { data: loginData, error: loginError } = await anon.auth.signInWithPassword({
      email: account.auth_email,
      password
    });

    if (loginError || !loginData.session) {
      return json(401, {
        error: `Supabase Auth 登入失敗。系統搵到 account「${account.username}」，但用 email「${account.auth_email}」登入唔到。請檢查 Supabase Auth 個 email 是否一樣，或 reset password 後再試。`
      });
    }

    return json(200, {
      session: loginData.session,
      account: {
        user_id: account.user_id,
        username: account.username,
        role: account.role,
        label: account.label,
        contact_email: account.contact_email
      }
    });
  } catch (error) {
    return json(500, { error: error.message || '登入暫時失敗。' });
  }
};
