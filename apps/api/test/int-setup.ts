import { execSync } from 'node:child_process';
import pg from 'pg';

// Crea la base de test si no existe y le aplica las migraciones.
export default async function setup() {
  const url = new URL(process.env.DATABASE_URL!);
  const database = url.pathname.slice(1);

  const admin = new URL(url);
  admin.pathname = '/postgres';
  admin.search = '';

  const client = new pg.Client({ connectionString: admin.toString() });
  await client.connect();
  const { rowCount } = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [database],
  );
  if (!rowCount) await client.query(`CREATE DATABASE "${database}"`);
  await client.end();

  execSync('npx prisma migrate deploy', { stdio: 'inherit', env: process.env });
}
