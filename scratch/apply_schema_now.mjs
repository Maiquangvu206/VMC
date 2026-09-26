import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '..', 'server', '.env') });

async function migrate() {
  console.log('Connecting with env params:', {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME
  });

  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'vmc_portal',
      port: Number(process.env.DB_PORT) || 3306
    });
  } catch (err) {
    console.log('Failed env user, trying root with empty password...');
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'vmc_portal',
      port: 3306
    });
  }

  console.log('Connected to MySQL successfully!');

  // 1. Create Recruitment_Evaluations
  console.log('Creating Recruitment_Evaluations table...');
  await connection.query(`
    CREATE TABLE IF NOT EXISTS Recruitment_Evaluations (
      id VARCHAR(100) PRIMARY KEY,
      season_id VARCHAR(100) NOT NULL,
      candidate_id VARCHAR(100) NOT NULL,
      interview_code VARCHAR(100),
      interviewer_id VARCHAR(100) NOT NULL,
      round_type VARCHAR(50) NOT NULL,
      total_score DECIMAL(5,2) DEFAULT 0,
      avg_score DECIMAL(5,2) DEFAULT 0,
      scores_json LONGTEXT,
      comments TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY candidate_interviewer_round (candidate_id, interviewer_id, round_type)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  // 2. Add columns to Recruitment_Criteria
  console.log('Altering Recruitment_Criteria...');
  await connection.query('ALTER TABLE Recruitment_Criteria ADD COLUMN round_type VARCHAR(50) DEFAULT "don"').catch(e => console.log('Criteria round_type:', e.message));
  await connection.query('ALTER TABLE Recruitment_Criteria ADD COLUMN difficulty VARCHAR(50) DEFAULT "Trung bình"').catch(e => console.log('Criteria difficulty:', e.message));

  // 3. Add columns to Recruitment_Seasons
  console.log('Altering Recruitment_Seasons...');
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN active_round VARCHAR(50) DEFAULT "don"').catch(e => console.log('Season active_round:', e.message));
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN teamwork_scorer_ids TEXT').catch(e => console.log('Season teamwork_scorer_ids:', e.message));
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN challenge_process_scorer_ids TEXT').catch(e => console.log('Season challenge_process_scorer_ids:', e.message));
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN challenge_result_scorer_ids TEXT').catch(e => console.log('Season challenge_result_scorer_ids:', e.message));
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN lead_interviewer_id VARCHAR(100)').catch(e => console.log('Season lead_interviewer_id:', e.message));
  await connection.query('ALTER TABLE Recruitment_Seasons ADD COLUMN selected_questions TEXT').catch(e => console.log('Season selected_questions:', e.message));

  // 4. Add columns to Recruitment_Candidates
  console.log('Altering Recruitment_Candidates...');
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN interview_code VARCHAR(100)').catch(e => console.log('Cand interview_code:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN application_answers TEXT').catch(e => console.log('Cand application_answers:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN challenge_process_scorer_ids TEXT').catch(e => console.log('Cand challenge_process_scorer_ids:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN challenge_result_scorer_ids TEXT').catch(e => console.log('Cand challenge_result_scorer_ids:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN lead_interviewer_id VARCHAR(100)').catch(e => console.log('Cand lead_interviewer_id:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN selected_questions TEXT').catch(e => console.log('Cand selected_questions:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN facebook TEXT').catch(e => console.log('Cand facebook:', e.message));
  await connection.query('ALTER TABLE Recruitment_Candidates ADD COLUMN challenge_topic TEXT').catch(e => console.log('Cand challenge_topic:', e.message));
  await connection.query("UPDATE Recruitment_Candidates SET interview_code = id WHERE interview_code IS NULL OR interview_code = ''").catch(() => {});

  // 5. Backfill Recruitment_Evaluations from Recruitment_Scores
  console.log('Backfilling Recruitment_Evaluations from Recruitment_Scores...');
  try {
    const [res] = await connection.query(`
      INSERT INTO Recruitment_Evaluations (id, candidate_id, interview_code, season_id, interviewer_id, round_type, total_score, avg_score, comments)
      SELECT 
        CONCAT('eval-', s.candidate_id, '-', COALESCE(s.interviewer_id, '0'), '-', COALESCE(cr.round_type, 'don')) AS id,
        s.candidate_id,
        COALESCE(c.interview_code, s.candidate_id),
        COALESCE(s.season_id, c.season_id, 'season-1790279561020'),
        s.interviewer_id,
        COALESCE(NULLIF(cr.round_type, ''), 'don') AS round_type,
        ROUND(SUM(s.score), 2) AS total_score,
        ROUND(AVG(s.score), 2) AS avg_score,
        MAX(s.comments) AS comments
      FROM Recruitment_Scores s
      LEFT JOIN Recruitment_Criteria cr ON s.criteria_id = cr.id
      LEFT JOIN Recruitment_Candidates c ON (s.candidate_id = c.id OR s.candidate_id = c.interview_code)
      GROUP BY s.candidate_id, s.interviewer_id, COALESCE(NULLIF(cr.round_type, ''), 'don')
      ON DUPLICATE KEY UPDATE 
        total_score = VALUES(total_score),
        avg_score = VALUES(avg_score),
        comments = VALUES(comments),
        season_id = VALUES(season_id)
    `);
    console.log('Backfill complete! Affected rows:', res.affectedRows);
  } catch (e) {
    console.log('Backfill error:', e.message);
  }

  const [tables] = await connection.query('SHOW TABLES FROM vmc_portal');
  console.log('Current tables in vmc_portal:', tables.map(t => Object.values(t)[0]));

  await connection.end();
}

migrate().catch(console.error);
