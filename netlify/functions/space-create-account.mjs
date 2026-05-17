import { json, logAudit, makeAuthEmail, normalizeUsername, parseBody, requireAdmin } from './_space-utils.mjs';

const findAuthUserByEmail = async (admin, email) => {
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const user = (data.users || []).find((item) => item.email === email);
    if (user) return user;
    if (!data.users || data.users.length < 1000) return null;
    page += 1;
  }
  return null;
};

const ensureSpaceRows = async (admin, { userId, username, authEmail, role, label, contactEmail, actorId }) => {
  const { error: accountError } = await admin.from('user_accounts').upsert({
    user_id: userId,
    username,
    auth_email: authEmail,
    role,
    label,
    contact_email: contactEmail,
    created_by: actorId
  }, { onConflict: 'user_id' });
  if (accountError) throw accountError;

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    display_name: label,
    contact_email: contactEmail
  }, { onConflict: 'id' });
  if (profileError) throw profileError;

  if (role === 'staff') {
    const { error: adminError } = await admin.from('admin_users').upsert({ user_id: userId }, { onConflict: 'user_id' });
    if (adminError) throw adminError;
  } else {
    const { error: threadError } = await admin.from('message_threads').upsert({ customer_id: userId }, { onConflict: 'customer_id' });
    if (threadError) throw threadError;
  }
};

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
      .select('user_id, username, role, label, contact_email')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      await ensureSpaceRows(admin, {
        userId: existing.user_id,
        username: existing.username,
        authEmail,
        role: existing.role,
        label: existing.label || label,
        contactEmail: existing.contact_email || contactEmail,
        actorId: actor.id
      });
      await logAudit(admin, actor.id, existing.user_id, 'create_account', { username, role: existing.role, repaired: true });

      return json(200, {
        repaired: true,
        account: {
          user_id: existing.user_id,
          username: existing.username,
          role: existing.role,
          label: existing.label || label,
          contact_email: existing.contact_email || contactEmail
        }
      });
    }

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

    let authUser = created?.user || null;
    if (createError || !authUser) {
      const existingAuthUser = await findAuthUserByEmail(admin, authEmail);
      if (!existingAuthUser) throw createError || new Error('建立 Auth user 失敗。');
      authUser = existingAuthUser;
    }

    const userId = authUser.id;

    await ensureSpaceRows(admin, {
      userId,
      username,
      auth_email: authEmail,
      role,
      label,
      contact_email: contactEmail,
      actorId: actor.id
    });

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
