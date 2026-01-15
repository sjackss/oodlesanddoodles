/**
 * Copyright (c) 2025 Oodles & Doodles
 * All rights reserved.
 * Owner: sjackss
 * 
 * This file is part of Oodles & Doodles dating application.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 */

// netlify/functions/api-messages.js
import { sql } from './db.js';

export async function handler(event) {
  const method = event.httpMethod;

  try {
    if (method === 'GET') {
      const params = event.queryStringParameters || {};
      const chatId = params.chat_id;
      const userId = params.user_id; // Current user ID to mark messages as read

      if (!chatId) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'chat_id is required' }),
        };
      }

      // Get messages for this chat (only from last 14 days)
      const { rows } = await sql`
        SELECT id, from_user_id, to_user_id, text, image_url, audio_url, created_at, read_at
        FROM messages
        WHERE chat_id = ${chatId}
          AND created_at > NOW() - INTERVAL '14 days'
        ORDER BY created_at ASC
        LIMIT 200
      `;

      // Mark messages as read if user_id is provided
      if (userId && rows.length > 0) {
        await sql`
          UPDATE messages
          SET read_at = NOW()
          WHERE chat_id = ${chatId}
            AND to_user_id = ${userId}
            AND read_at IS NULL
        `;
      }

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

      // Validate required fields
      if (!chat_id || !from_user_id || !to_user_id) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'chat_id, from_user_id, and to_user_id are required'
          }),
        };
      }

      if (!text && !image_url && !audio_url) {
        return {
          statusCode: 400,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            error: 'At least one of text, image_url, or audio_url is required'
          }),
        };
      }

      // Insert message and return the created message with ID
      const result = await sql`
        INSERT INTO messages (chat_id, from_user_id, to_user_id, text, image_url, audio_url)
        VALUES (${chat_id}, ${from_user_id}, ${to_user_id}, ${text}, ${image_url}, ${audio_url})
        RETURNING id, chat_id, from_user_id, to_user_id, text, image_url, audio_url, created_at
      `;

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: true,
          message: result[0]
        }),
      };
    }

    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  } catch (err) {
    console.error('API Messages Error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Server error',
        message: err.message
      }),
    };
  }
}

