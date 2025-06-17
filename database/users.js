import db from './connection.js';

export async function createUser(username, hashedPassword) {
  const result = await db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
  return result.lastID;
}

export async function createUserStats(userId) {
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

export async function getUserWithStats(userId) {
  return db.get(`
    SELECT users.username, user_stats.wins, user_stats.losses, user_stats.games_played
    FROM users
    JOIN user_stats ON users.id = user_stats.user_id
    WHERE users.id = ?
  `, [userId]);
}
