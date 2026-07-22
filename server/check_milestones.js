import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function check() {
  try {
    const milestones = await queryDatabase('SELECT * FROM Member_Milestones');
    const members = await queryDatabase('SELECT id, member_code, username, full_name, milestones FROM Members');
    console.log('=== MEMBERS IN MYSQL ===');
    console.log(JSON.stringify(members, null, 2));
    console.log('=== MILESTONES IN MYSQL ===');
    console.log(JSON.stringify(milestones, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
