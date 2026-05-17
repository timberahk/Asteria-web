import { getAdminClient, getBearerToken, json, parseBody } from './_space-utils.mjs';

const normalizeDate = (value) => {
  const text = String(value || '').trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : new Date().toISOString().slice(0, 10);
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
    const entryType = body.entryType === 'journal' ? 'journal' : 'relationship';
    const entryDate = normalizeDate(body.entryDate);
    const entryBody = String(body.body || '').trim();
    const title = String(body.title || '').trim();

    if (!entryBody) return json(400, { error: '請先輸入內容。' });

    const { data: entry, error } = await admin
      .from('space_entries')
      .insert({
        customer_id: userData.user.id,
        entry_type: entryType,
        entry_date: entryDate,
        title,
        body: entryBody
      })
      .select()
      .single();

    if (error) throw error;
    return json(200, { entry });
  } catch (error) {
    return json(500, { error: error.message || '內容暫時儲存唔到。' });
  }
};
