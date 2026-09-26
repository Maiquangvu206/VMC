import mysql from 'mysql2/promise';

async function checkScores() {
  const conn = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'vmc_portal' });
  
  const [candidates] = await conn.query('SELECT * FROM recruitment_candidates');
  console.log('Candidates count:', candidates.length);
  if (candidates.length > 0) console.log('Sample candidate:', candidates[0]);

  const [scores] = await conn.query('SELECT * FROM recruitment_scores');
  console.log('Scores count:', scores.length);
  if (scores.length > 0) console.log('Sample score:', scores[0]);

  const [evals] = await conn.query('SELECT * FROM recruitment_evaluations');
  console.log('Evaluations count:', evals.length);

  await conn.end();
}

checkScores().catch(console.error);
