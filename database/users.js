import db from './connection.js';

export async function createUser(username, hashedPassword) {
  const result = await db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
  return result.lastID;
}

export async function createUserStats(userId) {
  // You might want to keep or remove this depending if you use it for something else
  return db.run(
    'INSERT INTO user_stats (user_id) VALUES (?)',
    [userId]
  );
}

export async function getUserByUsername(username) {
  return db.get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
}

// Removed getUserWithStats, recordWin, recordLoss to disable stats tracking completely
