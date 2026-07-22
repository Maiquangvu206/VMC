import mysql from 'mysql2/promise';

async function run() {
  const conn = await mysql.createConnection({
    host: '192.168.10.106',
    user: 'vmc_admin',
    password: 'VMC2026@VinhBao',
    database: 'vmc_portal'
  });

  try {
    await conn.execute("ALTER TABLE Fanpage_Drafts ADD COLUMN publishDate DATETIME, ADD COLUMN graderId INT, ADD COLUMN gradingStatus VARCHAR(50) DEFAULT 'none', ADD COLUMN content TEXT;");
    console.log("Altered Fanpage_Drafts successfully!");
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log("Columns already exist in Fanpage_Drafts.");
    } else {
      console.error(e);
    }
  }

  try {
    await conn.execute("ALTER TABLE Fanpage_Drafts ADD COLUMN author VARCHAR(100);");
    console.log("Added author string column.");
  } catch(e) {}

  await conn.end();
}
run();
