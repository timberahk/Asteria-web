import { json, parseBody, requireAdmin } from './_space-utils.mjs';

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') return json(405, { error: 'Method not allowed' });

  try {
    const { admin } = await requireAdmin(event);
    const { messageId } = parseBody(event);

    if (!messageId) return json(400, { error: '搵唔到訊息。' });

    const { data: message, error: messageError } = await admin
      .from('chat_messages')
      .select('id, sender_role')
      .eq('id', messageId)
      .single();

    if (messageError || !message) return json(404, { error: '搵唔到訊息。' });

    if (message.sender_role !== 'admin') {
      return json(400, { error: '只可以收回客服發出的訊息。' });
    }

    const { error: deleteError } = await admin
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) throw deleteError;

    return json(200, { ok: true });
  } catch (error) {
    return json(error.statusCode || 500, { error: error.message || '收回訊息失敗。' });
  }
};
