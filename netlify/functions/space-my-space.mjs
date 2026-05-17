import { getAdminClient, getBearerToken, json } from './_space-utils.mjs';

const isMissingRelationError = (error) => error && ['42P01', 'PGRST205'].includes(error.code);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const token = getBearerToken(event);
    if (!token) return json(401, { error: '請先登入。' });

    const admin = getAdminClient();
    const { data: userData, error: userError } = await admin.auth.getUser(token);
    if (userError || !userData.user) return json(401, { error: '登入已過期，請重新登入。' });

    const userId = userData.user.id;
    const { data: account, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username, role, label, contact_email')
      .eq('user_id', userId)
      .single();

    if (accountError || !account) return json(404, { error: '搵唔到你的 Asteria Space account，請聯絡客服。' });

    let { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (profileError) throw profileError;

    if (!profile) {
      const createdProfile = await admin
        .from('profiles')
        .upsert({
          id: userId,
          display_name: account.label,
          contact_email: account.contact_email
        }, { onConflict: 'id' })
        .select()
        .single();
      if (createdProfile.error) throw createdProfile.error;
      profile = createdProfile.data;
    }

    let { data: thread, error: threadError } = await admin
      .from('message_threads')
      .select('*')
      .eq('customer_id', userId)
      .maybeSingle();
    if (threadError) throw threadError;

    if (!thread && account.role !== 'staff') {
      const createdThread = await admin
        .from('message_threads')
        .upsert({ customer_id: userId }, { onConflict: 'customer_id' })
        .select()
        .single();
      if (createdThread.error) throw createdThread.error;
      thread = createdThread.data;
    }

    const { data: messages, error: messagesError } = thread
      ? await admin
        .from('chat_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true })
      : { data: [], error: null };
    if (messagesError) throw messagesError;

    const { data: entries, error: entriesError } = await admin
      .from('space_entries')
      .select('*')
      .eq('customer_id', userId)
      .order('entry_date', { ascending: false })
      .order('created_at', { ascending: false });
    if (entriesError && !isMissingRelationError(entriesError)) throw entriesError;

    return json(200, {
      account,
      profile,
      thread,
      messages: messages || [],
      entries: entriesError ? [] : entries || []
    });
  } catch (error) {
    return json(500, { error: error.message || 'Asteria Space 資料暫時載入唔到。' });
  }
};
