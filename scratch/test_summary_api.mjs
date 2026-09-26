import mysql from 'mysql2/promise';

async function testApi() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'vmc_portal'
  });

  const seasonId = 'season-1790279561020';

  const [candidates] = await connection.query(`
    SELECT c.id AS candidate_id, c.interview_code, c.full_name, c.class_name, c.desired_dept, c.status, c.notes
    FROM recruitment_candidates c
    WHERE c.season_id = ?
  `, [seasonId]);
  console.log('Candidates found for season:', candidates.length);

  const [scores] = await connection.query(`
    SELECT * FROM recruitment_scores WHERE season_id = ? OR candidate_id IN (SELECT id FROM recruitment_candidates WHERE season_id = ?) OR candidate_id IN (SELECT interview_code FROM recruitment_candidates WHERE season_id = ?)
  `, [seasonId, seasonId, seasonId]);
  console.log('Scores found for season:', scores.length);

  const [evals] = await connection.query(`
    SELECT * FROM recruitment_evaluations WHERE season_id = ? OR candidate_id IN (SELECT id FROM recruitment_candidates WHERE season_id = ?) OR candidate_id IN (SELECT interview_code FROM recruitment_candidates WHERE season_id = ?)
  `, [seasonId, seasonId, seasonId]);
  console.log('Evaluations found for season:', evals.length);

  const [allSeasons] = await connection.query('SELECT id, name FROM recruitment_seasons');
  console.log('All Seasons:', allSeasons);

  await connection.end();
}

testApi().catch(console.error);
