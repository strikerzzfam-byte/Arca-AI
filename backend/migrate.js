import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { projects } from './schema.js';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function migrate() {
  try {
    console.log('Creating projects table...');
    
    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        prompt TEXT,
        files JSONB NOT NULL,
        generated_code TEXT,
        preview_url TEXT,
        is_public BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `;
    
    console.log('Projects table created successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

migrate();