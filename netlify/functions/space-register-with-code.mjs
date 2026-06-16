import {
  assertRateLimit,
  getAdminClient,
  getClientIp,
  json,
  makeAuthEmail,
  normalizeUsername,
  parseBody
} from './_space-utils.mjs';

const usernamePattern = /^[a-z0-9._-]{3,32}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const defaultInviteCodes = ['asteria-space-2026'];

const getInviteCodes = () =>
  [
    ...defaultInviteCodes,
    ...String(process.env.SPACE_INVITE_CODES || '')
      .split(',')
      .map((code) => code.trim().toLowerCase())
      .filter(Boolean)
  ];

const isValidInviteCode = (value) => {
  const codes = getInviteCodes();
  if (codes.length === 0) return false;
  return codes.includes(String(value || '').trim().toLowerCase());
};

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

const ensureCustomerRows = async (admin, { userId, username, authEmail, label, contactEmail }) => {
  const { error: accountError } = await admin.from('user_accounts').upsert({
    user_id: userId,
    username,
    auth_email: authEmail,
    role: 'customer',
    label,
    contact_email: contactEmail
  }, { onConflict: 'user_id' });
  if (accountError) throw accountError;

  const { error: profileError } = await admin.from('profiles').upsert({
    id: userId,
    display_name: label,
    self_name: label,
    contact_email: contactEmail
  }, { onConflict: 'id' });
  if (profileError) throw profileError;

  const { error: threadError } = await admin
    .from('message_threads')
    .upsert({ customer_id: userId }, { onConflict: 'customer_id' });
  if (threadError) throw threadError;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    assertRateLimit({
      key: `register:${getClientIp(event)}`,
      limit: 6,
      windowMs: 15 * 60 * 1000
    });

    if (getInviteCodes().length === 0) {
      return json(403, { error: '自助註冊暫未開放，請先 WhatsApp Asteria 取邀請碼。' });
    }

    const body = parseBody(event);
    const username = normalizeUsername(body.username);
    const password = String(body.password || '').trim();
    const label = String(body.label || '').trim();
    const contactEmail = String(body.contactEmail || '').trim();
    const inviteCode = String(body.inviteCode || '').trim();

    if (!isValidInviteCode(inviteCode)) return json(403, { error: '邀請碼不正確，請向 Asteria 確認。' });
    if (!usernamePattern.test(username)) return json(400, { error: 'Account 名只可以用英文細階、數字、點、底線或橫線，3 至 32 個字。' });
    if (password.length < 8) return json(400, { error: 'Password 最少 8 個字。' });
    if (!label) return json(400, { error: '請填自己名或暱稱。' });
    if (!emailPattern.test(contactEmail)) return json(400, { error: '請填有效 Email，方便日後搵返帳戶。' });

    const admin = getAdminClient();
    const authEmail = makeAuthEmail(username);

    const { data: existingAccount } = await admin
      .from('user_accounts')
      .select('user_id')
      .eq('username', username)
      .maybeSingle();

    if (existingAccount) return json(409, { error: '呢個 Account 名已經有人用，請換另一個。' });

    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username,
        role: 'customer',
        label
      }
    });

    let authUser = created?.user || null;
    if (createError || !authUser) {
      const message = String(createError?.message || '');
      if (!message.toLowerCase().includes('already')) throw createError || new Error('建立 account 失敗。');
      authUser = await findAuthUserByEmail(admin, authEmail);
      if (!authUser) return json(409, { error: '呢個 Account 名已經有人用，請換另一個。' });
    }

    const userId = authUser.id;
    await ensureCustomerRows(admin, {
      userId,
      username,
      authEmail,
      label,
      contactEmail
    });

    const { data: sessionData, error: tokenError } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: authEmail
    });

    if (tokenError || !sessionData?.properties?.hashed_token) {
      return json(200, {
        account: {
          user_id: userId,
          username,
          role: 'customer',
          label,
          contact_email: contactEmail
        }
      });
    }

    const { data: verifyData, error: verifyError } = await admin.auth.verifyOtp({
      type: 'magiclink',
      token_hash: sessionData.properties.hashed_token
    });
    if (verifyError || !verifyData?.session) {
      return json(200, {
        account: {
          user_id: userId,
          username,
          role: 'customer',
          label,
          contact_email: contactEmail
        }
      });
    }

    return json(200, {
      session: verifyData.session,
      account: {
        user_id: userId,
        username,
        role: 'customer',
        label,
        contact_email: contactEmail
      }
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || '註冊失敗，請稍後再試。' });
  }
};
