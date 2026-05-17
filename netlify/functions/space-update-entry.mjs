import { getAdminClient, getBearerToken, json, parseBody } from './_space-utils.mjs';

const normalizeDate = (value) => {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const token = getBearerToken(event);
    if (!token) return json(401, { error: '請先登入。' });

    const admin = getAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json(401, { error: '登入已過期，請重新登入。' });

    const body = parseBody(event);
    const entryId = String(body.entryId || '').trim();
    const entryBody = String(body.body || '').trim();
    const entryDate = normalizeDate(body.entryDate);
    const title = body.title === undefined ? undefined : String(body.title || '').trim();

    if (!entryId) return json(400, { error: '搵唔到要更新的內容。' });
    if (!entryBody) return json(400, { error: '請先輸入內容。' });

    const { data: existing, error: existingError } = await admin
      .from('space_entries')
      .select('id, customer_id, created_at')
      .eq('id', entryId)
      .single();
    if (existingError || !existing) return json(404, { error: '搵唔到呢段內容。' });
    if (existing.customer_id !== userData.user.id) return json(403, { error: '你只可以修改自己的內容。' });
    if (new Date(existing.created_at).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000) {
      return json(403, { error: '只可以修改最近 7 日新增的內容。' });
    }

    const updatePayload = {
      body: entryBody,
      ...(entryDate ? { entry_date: entryDate } : {}),
      ...(title !== undefined ? { title } : {})
    };

    const { data: entry, error } = await admin
      .from('space_entries')
      .update(updatePayload)
      .eq('id', entryId)
      .select()
      .single();

    if (error) throw error;
    return json(200, { entry });
  } catch (error) {
    return json(500, { error: error.message || '內容暫時更新唔到。' });
  }
};
