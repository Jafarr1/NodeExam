import db from './connection.js';

export async function createUser(username, hashedPassword) {
  const result = await db.run(
    'INSERT INTO users (username, password) VALUES (?, ?)',
    [username, hashedPassword]
  );
  return result.lastID;
}


export async function getUserByUsername(username) {
  return db.get(
    'SELECT * FROM users WHERE username = ?',
    [username]
  );
}
