/**
 * Copyright (c) 2025 Oodles & Doodles
 * All rights reserved.
 * Owner: sjackss
 * 
 * This file is part of Oodles & Doodles dating application.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 */

// Database configuration for Oodles & Doodles
import { neon } from '@neondatabase/serverless';

// Get database URL from environment variable
const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create and export sql function
export const sql = neon(DATABASE_URL);

// Export helper functions
export async function testConnection() {
  try {
    const result = await sql`SELECT NOW()`;
    console.log('Database connected:', result);
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
