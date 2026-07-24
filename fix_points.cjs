const fs = require('fs');
let c = fs.readFileSync('e:/VMC/server/api.js', 'utf8');

// 1. Remove points_reward from GET /tasks response mapping
c = c.replace(/\s*pointsReward: t\.points_reward \|\| 10,\r?\n/g, '\n');

// 2. Remove the email template line for points_reward
c = c.replace(/\r?\n\s*\$\{\(points_reward[^\n]+\n/g, '\n');

// 3. Remove points_reward from PUT /tasks destructuring
c = c.replace(', points_reward } = req.body;', ' } = req.body;');

// 4. Remove points_reward from UPDATE Tasks SET clause
c = c.replace(', points_reward = COALESCE(?, points_reward)', '');

// 5. Remove points_reward param from UPDATE array
c = c.replace(/\s*points_reward !== undefined \? points_reward : null,\r?\n/g, '\n');

fs.writeFileSync('e:/VMC/server/api.js', c);
console.log('Done');
