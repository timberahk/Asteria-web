import { json, logAudit, normalizeUsername, parseBody, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin, user: actor } = await requireAdmin(event);
    const { username, password } = parseBody(event);
    const normalizedUsername = normalizeUsername(username);
    const nextPassword = String(password || '').trim();

    if (!normalizedUsername) return json(400, { error: '請輸入 account 名。' });
    if (nextPassword.length < 8) return json(400, { error: '新 password 最少 8 個字。' });

    const { data: account, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username')
      .eq('username', normalizedUsername)
      .single();

    if (accountError || !account) return json(404, { error: '搵唔到呢個 account。' });

    const { error: updateError } = await admin.auth.admin.updateUserById(account.user_id, {
      password: nextPassword
    });
    if (updateError) throw updateError;

    await logAudit(admin, actor.id, account.user_id, 'reset_password', { username: account.username });
    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Reset password 失敗。' });
  }
};
