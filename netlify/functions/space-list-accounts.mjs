import { json, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin } = await requireAdmin(event);
    const { data, error } = await admin
      .from('user_accounts')
      .select('user_id, username, role, label, contact_email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return json(200, { accounts: data || [] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Account list 暫時載入唔到。' });
  }
};
