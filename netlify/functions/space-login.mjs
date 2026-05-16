import { getAdminClient, getAnonClient, json, normalizeUsername, parseBody } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { username, password } = parseBody(event);
    const normalizedUsername = normalizeUsername(username);
    if (!normalizedUsername || !password) return json(400, { error: '請輸入 account 名同 password。' });

    const admin = getAdminClient();
    const { data: account, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username, auth_email, role, label, contact_email')
      .eq('username', normalizedUsername)
      .single();

    if (accountError || !account) return json(401, { error: '登入資料不正確。' });

    const anon = getAnonClient();
    const { data: loginData, error: loginError } = await anon.auth.signInWithPassword({
      email: account.auth_email,
      password
    });

    if (loginError || !loginData.session) return json(401, { error: '登入資料不正確。' });

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
