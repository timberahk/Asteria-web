import { json, parseBody, requireAdmin } from './_space-utils.mjs';

const isMissingRelationError = (error) => error && ['42P01', 'PGRST205'].includes(error.code);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin } = await requireAdmin(event);
    const { customerId, threadId } = parseBody(event);

    if (!customerId && !threadId) return json(400, { error: '搵唔到要載入的對話。' });

    let threadQuery = admin.from('message_threads').select('*');
    threadQuery = threadId
      ? threadQuery.eq('id', String(threadId))
      : threadQuery.eq('customer_id', String(customerId));

    const { data: thread, error: threadError } = await threadQuery.single();
    if (threadError || !thread) return json(404, { error: '搵唔到對話。' });

    const [accountResult, profileResult, entryResult, messageResult] = await Promise.all([
      admin
        .from('user_accounts')
        .select('user_id, username, role, label, contact_email, created_at')
        .eq('user_id', thread.customer_id)
        .maybeSingle(),
      admin.from('profiles').select('*').eq('id', thread.customer_id).maybeSingle(),
      admin
        .from('space_entries')
        .select('*')
        .eq('customer_id', thread.customer_id)
        .order('entry_date', { ascending: false })
        .order('created_at', { ascending: false }),
      admin
        .from('chat_messages')
        .select('*')
        .eq('thread_id', thread.id)
        .order('created_at', { ascending: true })
    ]);

    if (accountResult.error) throw accountResult.error;
    if (profileResult.error) throw profileResult.error;
    if (entryResult.error && !isMissingRelationError(entryResult.error)) throw entryResult.error;
    if (messageResult.error) throw messageResult.error;

    const senderIds = [...new Set((messageResult.data || []).map((message) => message.sender_id).filter(Boolean))];
    const { data: senderAccounts, error: senderError } = senderIds.length
      ? await admin.from('user_accounts').select('user_id, username, label').in('user_id', senderIds)
      : { data: [], error: null };
    if (senderError) throw senderError;

    const sendersById = (senderAccounts || []).reduce((map, account) => {
      map[account.user_id] = account;
      return map;
    }, {});

    const messages = (messageResult.data || []).map((message) => ({
      ...message,
      sender_label: sendersById[message.sender_id]?.label || sendersById[message.sender_id]?.username || null
    }));

    return json(200, {
      item: {
        account: accountResult.data || null,
        profile: profileResult.data || null,
        thread,
        read_state: null,
        messages,
        entries: entryResult.error ? [] : entryResult.data || []
      }
    });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || '對話暫時載入唔到。' });
  }
};
