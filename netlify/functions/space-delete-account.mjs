import { json, logAudit, normalizeUsername, parseBody, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin, user: actor } = await requireAdmin(event);
    const { username } = parseBody(event);
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername) return json(400, { error: '請輸入 account 名。' });

    const { data: account, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username')
      .eq('username', normalizedUsername)
      .single();

    if (accountError || !account) return json(404, { error: '搵唔到呢個 account。' });

    if (account.user_id === actor.id) {
      return json(400, { error: '唔可以刪除自己而家登入緊嘅 staff account。' });
    }

    await logAudit(admin, actor.id, account.user_id, 'delete_account', { username: account.username });

    const { error: deleteError } = await admin.auth.admin.deleteUser(account.user_id);
    if (deleteError) throw deleteError;

    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Delete account 失敗。' });
  }
};
