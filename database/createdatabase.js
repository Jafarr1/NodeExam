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


if (deleteMode) {
  console.log("Database reset and ready.");
} else {
  console.log("Users and user_stats tables ready.");
}
