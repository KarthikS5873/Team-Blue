import { readFileSync } from 'fs';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const sql = readFileSync(new URL('supabase/migrations/001_initial_schema.sql', import.meta.url), 'utf-8');
const { Pool } = pg;

const supabaseUrl = process.env.SUPABASE_URL;
const projectRef = new URL(supabaseUrl).hostname.split('.')[0];

const hosts = [
  `db.${projectRef}.supabase.co`,
  `${projectRef}.supabase.co`,
  `aws-0-ap-south-1.pooler.supabase.com`,
];

async function tryConnect() {
  for (const host of hosts) {
    try {
      const pool = new Pool({
        user: 'postgres',
        host,
        database: 'postgres',
        password: process.env.SUPABASE_SERVICE_KEY,
        port: 5432,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 8000
      });
      const client = await pool.connect();
      console.log(`Connected via ${host}:5432`);
      await client.query(sql);
      console.log('Migration applied successfully!');
      await client.end();
      await pool.end();
      return true;
    } catch (err) {
      console.log(`Failed via ${host}:5432 - ${err.message}`);
    }
  }

  // Try pooler port 6543 with tenant user
  try {
    const pool = new Pool({
      user: `postgres.${projectRef}`,
      host: `aws-0-ap-south-1.pooler.supabase.com`,
      database: 'postgres',
      password: process.env.SUPABASE_SERVICE_KEY,
      port: 6543,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 8000
    });
    const client = await pool.connect();
    console.log('Connected via pooler:6543');
    await client.query(sql);
    console.log('Migration applied successfully!');
    await client.end();
    await pool.end();
    return true;
  } catch (err) {
    console.log(`Failed via pooler:6543 - ${err.message}`);
  }

  return false;
}

async function run() {
  const ok = await tryConnect();
  if (!ok) {
    console.error('Could not connect to Supabase database.');
    process.exit(1);
  }
}

run();
