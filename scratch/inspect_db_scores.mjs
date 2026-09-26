import mysql from 'mysql2/promise';

async function check() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'vmc_portal',
    port: Number(process.env.DB_PORT) || 3306
  });

  console.log("=== Recruitment_Scores ===");
  const [scores] = await connection.query("SELECT * FROM Recruitment_Scores LIMIT 20");
  console.log(scores);

  console.log("=== Recruitment_Candidates ===");
  const [candidates] = await connection.query("SELECT id, interview_code, full_name, season_id FROM Recruitment_Candidates LIMIT 20");
  console.log(candidates);

  console.log("=== Recruitment_Evaluations ===");
  const [evals] = await connection.query("SELECT * FROM Recruitment_Evaluations LIMIT 20");
  console.log(evals);

  console.log("=== Recruitment_Criteria ===");
  const [criteria] = await connection.query("SELECT * FROM Recruitment_Criteria LIMIT 20");
  console.log(criteria);

  await connection.end();
}

check().catch(console.error);
