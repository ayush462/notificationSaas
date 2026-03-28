const fs = require('fs');
const path = require('path');
const pool = require('../db/pool');

/**
 * Automates the application of schema.sql to the database on boot.
 * Replaces manual psql commands and docker-entrypoint dependencies.
 */
async function runMigrations() {
  try {
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    if (!fs.existsSync(schemaPath)) {
      console.warn('⚠️ No schema.sql found at', schemaPath);
      return;
    }

    console.log('🔄 Running database auto-migrations...');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Run the entire schema. Since we use IF NOT EXISTS, it's safe and idempotent.
    await pool.query(schemaSql);
    
    console.log('✅ Database schema is up to date.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

module.exports = { runMigrations };
