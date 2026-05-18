import { json, requireAdmin } from './_space-utils.mjs';

const isMissingRelationError = (error) => error && ['42P01', 'PGRST205'].includes(error.code);

const mapLimit = async (items, limit, worker) => {
  const results = [];
  for (let index = 0; index < items.length; index += limit) {
    const chunk = items.slice(index, index + limit);
    results.push(...await Promise.all(chunk.map(worker)));
  }
  return results;
};

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin } = await requireAdmin(event);

    const { data: accounts, error: accountError } = await admin
      .from('user_accounts')
      .select('user_id, username, role, label, contact_email, created_at')
      .order('created_at', { ascending: false });

    if (accountError) throw accountError;

    const customerAccounts = (accounts || []).filter((account) => account.role !== 'staff');
    const customerIds = customerAccounts.map((account) => account.user_id);
    if (customerIds.length === 0) return json(200, { inbox: [] });

    const existingThreads = await admin
      .from('message_threads')
      .select('*')
      .in('customer_id', customerIds);
    if (existingThreads.error) throw existingThreads.error;

    const existingCustomerIds = new Set((existingThreads.data || []).map((thread) => thread.customer_id));
    const missingThreads = customerIds
      .filter((customerId) => !existingCustomerIds.has(customerId))
      .map((customer_id) => ({ customer_id }));

    if (missingThreads.length > 0) {
      const { error: upsertThreadError } = await admin
        .from('message_threads')
        .upsert(missingThreads, { onConflict: 'customer_id' });
      if (upsertThreadError) throw upsertThreadError;
    }

    const [threadResult, profileResult] = await Promise.all([
      admin.from('message_threads').select('*').in('customer_id', customerIds),
      admin.from('profiles').select('*').in('id', customerIds)
    ]);

    if (threadResult.error) throw threadResult.error;
    if (profileResult.error) throw profileResult.error;

    const threads = threadResult.data || [];
    const threadIds = threads.map((thread) => thread.id);
    const [latestMessageResults, readStateResult] = threadIds.length > 0
      ? await Promise.all([
        mapLimit(threadIds, 12, async (threadId) => {
          const { data, error } = await admin
            .from('chat_messages')
            .select('*')
            .eq('thread_id', threadId)
            .order('created_at', { ascending: false })
            .limit(1);
          if (error) throw error;
          return data?.[0] || null;
        }),
        admin.from('thread_read_states').select('*').in('thread_id', threadIds)
      ])
      : [[], { data: [], error: null }];
    if (readStateResult.error && !isMissingRelationError(readStateResult.error)) throw readStateResult.error;

    const readStatesByThread = (readStateResult.error ? [] : readStateResult.data || []).reduce((map, state) => {
      map[state.thread_id] = state;
      return map;
    }, {});

    const accountsByCustomer = customerAccounts.reduce((map, account) => {
      map[account.user_id] = account;
      return map;
    }, {});
    const accountsByUserId = (accounts || []).reduce((map, account) => {
      map[account.user_id] = account;
      return map;
    }, {});
    const profilesByCustomer = (profileResult.data || []).reduce((map, profile) => {
      map[profile.id] = profile;
      return map;
    }, {});
    const threadsByCustomer = threads.reduce((map, thread) => {
      map[thread.customer_id] = thread;
      return map;
    }, {});
    const messagesByThread = (latestMessageResults || []).filter(Boolean).reduce((map, message) => {
      const senderAccount = accountsByUserId[message.sender_id];
      map[message.thread_id] = [
        ...(map[message.thread_id] || []),
        {
          ...message,
          sender_label: senderAccount?.label || senderAccount?.username || null
        }
      ];
      return map;
    }, {});

    const inbox = customerIds
      .map((customerId) => {
        const thread = threadsByCustomer[customerId];
        return {
          account: accountsByCustomer[customerId] || null,
          profile: profilesByCustomer[customerId] || null,
          thread,
          read_state: thread ? (readStatesByThread[thread.id] || null) : null,
          messages: thread ? (messagesByThread[thread.id] || []) : [],
          entries: []
        };
      })
      .filter((item) => item.thread)
      .sort((a, b) => {
        const aLast = a.thread.last_message_at || a.thread.created_at || '';
        const bLast = b.thread.last_message_at || b.thread.created_at || '';
        return bLast.localeCompare(aLast);
      });

    return json(200, { inbox });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || 'Staff inbox 暫時載入唔到。' });
  }
};
