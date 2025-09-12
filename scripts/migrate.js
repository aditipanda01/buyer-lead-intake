const { drizzle } = require('drizzle-orm/libsql');
const { createClient } = require('@libsql/client');
const { migrate } = require('drizzle-orm/libsql/migrator');

async function runMigrations() {
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  const db = drizzle(client);

  console.log('Running migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations completed!');
}

runMigrations().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
