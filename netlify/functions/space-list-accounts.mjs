import { json, requireAdmin } from './_space-utils.mjs';

const listAuthUsers = async (admin) => {
  const users = [];
  let page = 1;
  while (page < 20) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    users.push(...(data.users || []));
    if (!data.users || data.users.length < 1000) break;
    page += 1;
  }
  return users;
};

const makeUsername = (user, usedUsernames) => {
  const metadataUsername = String(user.user_metadata?.username || '').trim().toLowerCase();
  const emailUsername = String(user.email || '').split('@')[0].trim().toLowerCase();
  const base = (metadataUsername || emailUsername || `user-${String(user.id).slice(0, 8)}`)
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || `user-${String(user.id).slice(0, 8)}`;

  let username = base;
  let index = 2;
  while (usedUsernames.has(username)) {
    username = `${base}-${index}`;
    index += 1;
  }
  usedUsernames.add(username);
  return username;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin } = await requireAdmin(event);
    const { data: accounts, error } = await admin
      .from('user_accounts')
      .select('user_id, username, role, label, contact_email, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const existingAccounts = accounts || [];
    const accountByUserId = new Map(existingAccounts.map((account) => [account.user_id, account]));
    const usedUsernames = new Set(existingAccounts.map((account) => account.username));

    const [{ data: adminRows, error: adminError }, authUsers] = await Promise.all([
      admin.from('admin_users').select('user_id'),
      listAuthUsers(admin)
    ]);

    if (adminError) throw adminError;

    const adminIds = new Set((adminRows || []).map((row) => row.user_id));
    const repairedAccounts = [];

    for (const user of authUsers) {
      if (accountByUserId.has(user.id)) continue;

      const role = adminIds.has(user.id) ? 'staff' : 'customer';
      const username = makeUsername(user, usedUsernames);
      const label = String(user.user_metadata?.label || user.user_metadata?.name || username || 'Asteria Space user').trim();
      const contactEmail = user.email && !user.email.endsWith('@accounts.asteria-space.local') ? user.email : null;
      const authEmail = user.email || `${username}@accounts.asteria-space.local`;

      const account = {
        user_id: user.id,
        username,
        auth_email: authEmail,
        role,
        label,
        contact_email: contactEmail
      };

      const { error: accountError } = await admin.from('user_accounts').upsert(account, { onConflict: 'user_id' });
      if (accountError) throw accountError;

      const { error: profileError } = await admin.from('profiles').upsert({
        id: user.id,
        display_name: label,
        contact_email: contactEmail
      }, { onConflict: 'id' });
      if (profileError) throw profileError;

      if (role === 'customer') {
        const { error: threadError } = await admin.from('message_threads').upsert({ customer_id: user.id }, { onConflict: 'customer_id' });
        if (threadError) throw threadError;
      }

      repairedAccounts.push({
        user_id: account.user_id,
        username: account.username,
        role: account.role,
        label: account.label,
        contact_email: account.contact_email,
        created_at: user.created_at || new Date().toISOString()
      });
    }

    return json(200, { accounts: [...repairedAccounts, ...existingAccounts] });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Account list 暫時載入唔到。' });
  }
};
