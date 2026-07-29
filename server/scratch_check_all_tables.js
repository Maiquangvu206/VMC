import { queryDatabase } from './db.js';

async function verify() {
  const tables = [
    'Recruitment_Seasons',
    'Recruitment_Criteria',
    'Recruitment_Candidates',
    'Recruitment_Scores'
  ];

  for (const table of tables) {
    try {
      console.log(`\n🔍 Checking table: ${table}`);
      const columns = await queryDatabase(`DESCRIBE ${table}`);
      console.log(`✅ Table [${table}] EXISTS. Columns:`);
      console.table(columns.map(c => ({
        Field: c.Field,
        Type: c.Type,
        Null: c.Null,
        Key: c.Key,
        Default: c.Default
      })));
    } catch (e) {
      console.error(`❌ Table [${table}] DOES NOT EXIST or error:`, e.message);
    }
  }
}

verify();
