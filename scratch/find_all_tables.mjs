import mysql from 'mysql2/promise';

async function findTables() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '' });
  const [dbs] = await conn.query('SHOW DATABASES');
  for (const dbRow of dbs) {
    const dbName = dbRow.Database;
    if (['information_schema', 'mysql', 'performance_schema', 'sys', 'phpmyadmin'].includes(dbName)) continue;
    try {
      const [tables] = await conn.query(`SHOW TABLES FROM \`${dbName}\``);
      console.log(`Database [${dbName}] tables:`);
      for (const t of tables) {
        const tableName = Object.values(t)[0];
        const [count] = await conn.query(`SELECT COUNT(*) as cnt FROM \`${dbName}\`.\`${tableName}\``);
        if (count[0].cnt > 0) {
          console.log(`   Table ${tableName}: ${count[0].cnt} rows`);
        }
      }
    } catch (e) {
      console.error(`Error querying ${dbName}:`, e.message);
    }
  }
  await conn.end();
}
findTables();
