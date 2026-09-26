import mysql from 'mysql2/promise';

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vmc_portal',
    port: Number(process.env.DB_PORT) || 3306
  });

  const tables = [
    'Members',
    'Recruitment_Seasons',
    'Recruitment_Candidates',
    'Recruitment_Criteria',
    'Recruitment_Scores',
    'Recruitment_Evaluations',
    'Department_Drives',
    'Generations'
  ];

  for (const t of tables) {
    try {
      const [rows] = await connection.query(`SELECT COUNT(*) as cnt FROM \`${t}\``);
      console.log(`Table ${t}: ${rows[0].cnt} rows`);
    } catch (e) {
      console.log(`Table ${t}: ERROR -> ${e.message}`);
    }
  }

  await connection.end();
}

check().catch(console.error);
