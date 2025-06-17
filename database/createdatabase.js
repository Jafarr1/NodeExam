import db from './connection.js';

const deleteMode = process.argv.includes('--delete');

if (deleteMode) {
  await db.run(`DROP TABLE IF EXISTS user_stats;`);
  await db.run(`DROP TABLE IF EXISTS users;`);
}

await db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  );
`);

await db.exec(`
  CREATE TABLE IF NOT EXISTS user_stats (
    user_id INTEGER PRIMARY KEY,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

if (deleteMode) {
  console.log("Database reset and ready.");
} else {
  console.log("Users and user_stats tables ready.");
}
