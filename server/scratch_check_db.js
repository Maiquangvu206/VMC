import { queryDatabase } from './db.js';

async function check() {
  try {
    console.log('🔄 Running ALTER TABLE to fix column type...');
    await queryDatabase('ALTER TABLE Recruitment_Seasons MODIFY COLUMN department VARCHAR(255)');
    await queryDatabase('ALTER TABLE Recruitment_Seasons MODIFY COLUMN scoring_type LONGTEXT');
    await queryDatabase('ALTER TABLE Recruitment_Seasons MODIFY COLUMN interviewer_ids LONGTEXT');
    console.log('✅ ALTER TABLE SUCCESSFUL!');

    const tableInfo = await queryDatabase('DESCRIBE Recruitment_Seasons');
    console.log('NEW TABLE SCHEMA FOR Recruitment_Seasons:', tableInfo);
    
    const sid = 'test-' + Date.now();
    await queryDatabase(
      'INSERT INTO Recruitment_Seasons (id, name, quota, department, scoring_type) VALUES (?, ?, ?, ?, ?)',
      [sid, 'Test Season', 2, 'Ban Đối Ngoại - Nhân Sự', '["don","teamwork","phongvan"]']
    );
    console.log('✅ INSERT SUCCESSFUL NOW!');
    await queryDatabase('DELETE FROM Recruitment_Seasons WHERE id = ?', [sid]);
  } catch (err) {
    console.error('❌ SQL ERROR DETECTED:', err);
  }
}

check();
