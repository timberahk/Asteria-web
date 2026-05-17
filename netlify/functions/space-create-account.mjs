import { json, logAudit, makeAuthEmail, normalizeUsername, parseBody, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin, user: actor } = await requireAdmin(event);
    const body = parseBody(event);
    const username = normalizeUsername(body.username);
    const password = String(body.password || '').trim();
    const role = body.role === 'staff' ? 'staff' : 'customer';
    const label = String(body.label || username || 'Asteria Space user').trim();
    const contactEmail = String(body.contactEmail || '').trim() || null;
    const authEmail = makeAuthEmail(username);

    if (password.length < 8) return json(400, { error: 'Password 最少 8 個字。' });

    const { data: existing } = await admin
      .from('user_accounts')
      .select('username')
      .eq('username', username)
      .maybeSingle();

    if (existing) return json(409, { error: '呢個 account 名已經存在。' });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role,
        label
      }
    });

    if (createError || !created.user) throw createError || new Error('建立 Auth user 失敗。');

    const userId = created.user.id;

    const { error: accountError } = await admin.from('user_accounts').insert({
      user_id: userId,
      username,
      auth_email: authEmail,
      role,
      label,
      contact_email: contactEmail,
      created_by: actor.id
    });
    if (accountError) throw accountError;

    const { error: profileError } = await admin.from('profiles').insert({
      id: userId,
      display_name: label,
      contact_email: contactEmail
    });
    if (profileError) throw profileError;

    if (role === 'staff') {
      const { error: adminError } = await admin.from('admin_users').insert({ user_id: userId });
      if (adminError) throw adminError;
    } else {
      const { error: threadError } = await admin.from('message_threads').insert({ customer_id: userId });
      if (threadError) throw threadError;
    }

    await logAudit(admin, actor.id, userId, 'create_account', { username, role });

    return json(200, {
      account: {
        user_id: userId,
        username,
        role,
        label,
        contact_email: contactEmail
      }
    });
  } catch (error) {
    return json(500, { error: error.message || '新增 account 失敗。' });
  }
};
