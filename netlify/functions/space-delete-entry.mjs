import { getAdminClient, getBearerToken, json, parseBody } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const token = getBearerToken(event);
    if (!token) return json(401, { error: '請先登入。' });

    const admin = getAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json(401, { error: '登入已過期，請重新登入。' });

    const { entryId } = parseBody(event);
    const id = String(entryId || '').trim();
    if (!id) return json(400, { error: '搵唔到要刪除的內容。' });

    const { data: existing, error: existingError } = await admin
      .from('space_entries')
      .select('id, customer_id, created_at')
      .eq('id', id)
      .single();
    if (existingError || !existing) return json(404, { error: '搵唔到呢段內容。' });
    if (existing.customer_id !== userData.user.id) return json(403, { error: '你只可以刪除自己的內容。' });
    if (new Date(existing.created_at).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
      return json(403, { error: '只可以刪除最近 7 日新增的內容。' });
    }

    const { error } = await admin.from('space_entries').delete().eq('id', id);
    if (error) throw error;
    return json(200, { ok: true });
  } catch (error) {
    return json(500, { error: error.message || '內容暫時刪除唔到。' });
  }
};
