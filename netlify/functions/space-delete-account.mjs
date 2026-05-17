import { json, logAudit, normalizeUsername, parseBody, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin, user: actor } = await requireAdmin(event);
    const { username, userId } = parseBody(event);
    const normalizedUsername = normalizeUsername(username);

    if (!normalizedUsername && !userId) return json(400, { error: '請輸入 account 名。' });

    let accountQuery = admin
      .from('user_accounts')
      .select('user_id, username');

    accountQuery = userId ? accountQuery.eq('user_id', userId) : accountQuery.eq('username', normalizedUsername);

    const { data: account, error: accountError } = await accountQuery.maybeSingle();

    if (accountError) throw accountError;

    const targetUserId = account?.user_id || userId;
    const targetUsername = account?.username || normalizedUsername || String(userId).slice(0, 8);

    if (!targetUserId) return json(404, { error: '搵唔到呢個 account。' });

    if (targetUserId === actor.id) {
      return json(400, { error: '唔可以刪除自己而家登入緊嘅 staff account。' });
    }

    await logAudit(admin, actor.id, targetUserId, 'delete_account', { username: targetUsername });

    const { error: deleteError } = await admin.auth.admin.deleteUser(targetUserId);
    if (deleteError) throw deleteError;

    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Delete account 失敗。' });
  }
};
