import { json, requireAdmin } from './_space-utils.mjs';

const isMissingRelationError = (error) => error && error.code === '42P01';

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

    const [threadResult, profileResult, entryResult] = await Promise.all([
      admin.from('message_threads').select('*').in('customer_id', customerIds),
      admin.from('profiles').select('*').in('id', customerIds),
      admin.from('space_entries').select('*').in('customer_id', customerIds).order('entry_date', { ascending: false }).order('created_at', { ascending: false })
    ]);

    if (threadResult.error) throw threadResult.error;
    if (profileResult.error) throw profileResult.error;
    if (entryResult.error && !isMissingRelationError(entryResult.error)) throw entryResult.error;

    const threads = threadResult.data || [];
    const threadIds = threads.map((thread) => thread.id);
    const messageResult = threadIds.length > 0
      ? await admin.from('chat_messages').select('*').in('thread_id', threadIds).order('created_at', { ascending: true })
      : { data: [], error: null };
    if (messageResult.error) throw messageResult.error;

    const accountsByCustomer = customerAccounts.reduce((map, account) => {
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
    const messagesByThread = (messageResult.data || []).reduce((map, message) => {
      map[message.thread_id] = [...(map[message.thread_id] || []), message];
      return map;
    }, {});
    const entriesByCustomer = (entryResult.error ? [] : entryResult.data || []).reduce((map, entry) => {
      map[entry.customer_id] = [...(map[entry.customer_id] || []), entry];
      return map;
    }, {});

    const inbox = customerIds
      .map((customerId) => {
        const thread = threadsByCustomer[customerId];
        return {
          account: accountsByCustomer[customerId] || null,
          profile: profilesByCustomer[customerId] || null,
          thread,
          messages: thread ? (messagesByThread[thread.id] || []) : [],
          entries: entriesByCustomer[customerId] || []
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
    return json(500, { error: error.message || 'Staff inbox 暫時載入唔到。' });
  }
};
