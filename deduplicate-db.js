/**
 * ===================================================================
 * PDC SUPABASE DATABASE DEDUPLICATION & INTEGRITY ENGINE
 * ===================================================================
 * 
 * Exclusively maintains TWO tables:
 * 1. confirmation_stst
 * 2. pdc_bibwewadi_submissions
 * 
 * - Identifies and removes any duplicate records (keeps newest per phone)
 * - Enforces unique B-Tree performance indexes on both tables
 * 
 * Usage:
 *   node deduplicate-db.js
 * ===================================================================
 */

const { Client } = require('pg');

const connectionString = process.env.SUPABASE_DB_URL || 'postgresql://postgres:bkRy4Syw!%2Fu!SWR@db.newtaeknlmkugqmhcyxg.supabase.co:5432/postgres';

async function runDeduplication() {
  console.log('========================================================');
  console.log('   PDC SUPABASE DEDUPLICATION ENGINE (2 TABLES ONLY)    ');
  console.log('========================================================\n');

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database.');

    // 1. Deduplicate pdc_bibwewadi_submissions
    console.log('\n--- Checking [pdc_bibwewadi_submissions] ---');
    const bibDedup = await client.query(`
      WITH ranked AS (
        SELECT "Document ID", "whatsappNumber",
               ROW_NUMBER() OVER (
                 PARTITION BY "whatsappNumber" 
                 ORDER BY "timestamp" DESC NULLS LAST, "submittedAt" DESC NULLS LAST, "Document ID" DESC
               ) as rnk
        FROM "pdc_bibwewadi_submissions"
        WHERE "whatsappNumber" IS NOT NULL
      )
      DELETE FROM "pdc_bibwewadi_submissions"
      WHERE "Document ID" IN (SELECT "Document ID" FROM ranked WHERE rnk > 1);
    `);
    console.log(`   Removed ${bibDedup.rowCount} duplicate row(s) from pdc_bibwewadi_submissions.`);

    // 2. Deduplicate confirmation_stst
    console.log('\n--- Checking [confirmation_stst] ---');
    const confDedup = await client.query(`
      WITH ranked AS (
        SELECT "Document ID", "phoneNumber",
               ROW_NUMBER() OVER (
                 PARTITION BY "phoneNumber" 
                 ORDER BY "timestamp" DESC NULLS LAST, "submittedAt" DESC NULLS LAST, "Document ID" DESC
               ) as rnk
        FROM "confirmation_stst"
        WHERE "phoneNumber" IS NOT NULL
      )
      DELETE FROM "confirmation_stst"
      WHERE "Document ID" IN (SELECT "Document ID" FROM ranked WHERE rnk > 1);
    `);
    console.log(`   Removed ${confDedup.rowCount} duplicate row(s) from confirmation_stst.`);

    // 3. Ensure Unique Indexes for Maximum Performance & Duplicate Prevention
    console.log('\n--- Verifying Unique Performance Indexes ---');
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_bibwewadi_whatsapp_unique 
      ON "pdc_bibwewadi_submissions" ("whatsappNumber");

      CREATE UNIQUE INDEX IF NOT EXISTS idx_confirmation_stst_phone_unique 
      ON "confirmation_stst" ("phoneNumber");
    `);
    console.log('   ✅ Unique B-Tree indexes verified and active.');

    // 4. Verification summary
    const bibCount = await client.query('SELECT count(*) as total, count(DISTINCT "whatsappNumber") as unique_count FROM "pdc_bibwewadi_submissions";');
    const confCount = await client.query('SELECT count(*) as total, count(DISTINCT "phoneNumber") as unique_count FROM "confirmation_stst";');

    console.log('\n--- Database Integrity Verification ---');
    console.log(`   [confirmation_stst]:           Total=${confCount.rows[0].total}, Unique Phones=${confCount.rows[0].unique_count}`);
    console.log(`   [pdc_bibwewadi_submissions]:  Total=${bibCount.rows[0].total}, Unique Phones=${bibCount.rows[0].unique_count}`);

    console.log('\n========================================================');
    console.log('🎉 DEDUPLICATION & PERFORMANCE OPTIMIZATION COMPLETE');
    console.log('========================================================\n');

  } catch (err) {
    console.error('❌ Deduplication error:', err.message);
    process.exit(1);
  } finally {
    await client.end().catch(() => {});
  }
}

runDeduplication();
