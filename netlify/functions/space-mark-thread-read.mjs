import { json, parseBody, requireAdmin } from './_space-utils.mjs';

const isMissingRelationError = (error) => error && ['42P01', 'PGRST205'].includes(error.code);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin, user: actor } = await requireAdmin(event);
    const { threadId, mode } = parseBody(event);

    if (!threadId) return json(400, { error: '搵唔到對話。' });

    const { data: thread, error: threadError } = await admin
      .from('message_threads')
      .select('id')
      .eq('id', threadId)
      .single();

    if (threadError || !thread) return json(404, { error: '搵唔到對話。' });

    if (mode === 'unread') {
      const { data, error } = await admin
        .from('thread_read_states')
        .upsert({
          thread_id: threadId,
          last_read_at: null,
          is_unread: true,
          read_by: actor.id,
          updated_at: new Date().toISOString()
        }, { onConflict: 'thread_id' })
        .select()
        .single();

      if (error) {
        if (isMissingRelationError(error)) return json(200, { ok: true, read_state: null, unsupported: true });
        throw error;
      }

      return json(200, { ok: true, read_state: data });
    }

    const { data: latestMessage, error: latestError } = await admin
      .from('chat_messages')
      .select('created_at')
      .eq('thread_id', threadId)
      .eq('sender_role', 'customer')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestError) throw latestError;

    const lastReadAt = latestMessage?.created_at || new Date().toISOString();
    const { data, error } = await admin
      .from('thread_read_states')
      .upsert({
        thread_id: threadId,
        last_read_at: lastReadAt,
        is_unread: false,
        read_by: actor.id,
        updated_at: new Date().toISOString()
      }, { onConflict: 'thread_id' })
      .select()
      .single();

    if (error) {
      if (isMissingRelationError(error)) return json(200, { ok: true, read_state: null, unsupported: true });
      throw error;
    }

    return json(200, { ok: true, read_state: data });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || '已讀狀態暫時更新唔到。' });
  }
};
