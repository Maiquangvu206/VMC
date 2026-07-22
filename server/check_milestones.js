import { queryDatabase } from './db.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.join(__dirname, '.env') });

async function check() {
  try {
    const gens = await queryDatabase('SELECT * FROM Generations');
    console.log('=== GENERATIONS TABLE IN MYSQL ===');
    console.log(JSON.stringify(gens, null, 2));
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

check();
