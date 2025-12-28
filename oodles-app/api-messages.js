// netlify/functions/api-messages.js
import { sql } from './db.js';

export async function handler(event) {
  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const chatId = params.chat_id;

      const { rows } = await sql`
        SELECT id, from_user_id, to_user_id, text, image_url, audio_url, created_at
        FROM messages
        WHERE chat_id = ${chatId}
        ORDER BY created_at ASC
        LIMIT 200
      `;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rows),
      };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      const {
        chat_id,
        from_user_id,
        to_user_id,
        text,
        image_url,
        audio_url,
      } = body;

      await sql`
        INSERT INTO messages (chat_id, from_user_id, to_user_id, text, image_url, audio_url)
        VALUES (${chat_id}, ${from_user_id}, ${to_user_id}, ${text}, ${image_url}, ${audio_url})
      `;
      return { statusCode: 200, body: 'OK' };
    }

    return { statusCode: 405, body: 'Method Not Allowed' };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
}
