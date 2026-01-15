/**
 * Copyright (c) 2025 Oodles & Doodles
 * All rights reserved.
 * Owner: sjackss
 * 
 * This file is part of Oodles & Doodles dating application.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 */

// netlify/functions/api-cleanup-messages.js
// Scheduled function to delete messages older than 14 days
import { sql } from './db.js';

export async function handler(event) {
  // This function can be triggered by Netlify's scheduled functions
  // Configure in netlify.toml:
  // [[functions]]
  //   path = "api-cleanup-messages"
  //   schedule = "@daily"

  try {
    console.log('Starting message cleanup...');

    // Delete messages older than 14 days
    const result = await sql`
      DELETE FROM messages
      WHERE created_at < NOW() - INTERVAL '14 days'
    `;

    const deletedCount = result.count || 0;
    console.log(`Cleanup complete. Deleted ${deletedCount} old messages.`);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        deletedCount,
        message: `Deleted ${deletedCount} messages older than 14 days`
      }),
    };
  } catch (err) {
    console.error('Cleanup error:', err);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: 'Cleanup failed',
        message: err.message
      }),
    };
  }
}
