import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'express-handlebars';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import myIo from './sockets/io.js'; 
import { createUser, createUserStats, getUserByUsername } from './database/users.js';

const app = express();
const server = http.createServer(app);
const io = new SocketIO(server);
global.games = {};
myIo(io);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const Handlebars = handlebars.create({
  extname: '.html',
  partialsDir: path.join(__dirname, 'public', 'views', 'partials'),
  defaultLayout: false
});

app.use(express.json());
app.use(express.static("public"));
app.engine('html', Handlebars.engine);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'public', 'views'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


app.post('/api/signup', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  try {
    const existingUser = await getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ message: 'Username already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = await createUser(username, hashedPassword);
    await createUserStats(userId);

    res.status(201).json({ message: 'User registered successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Invalid username or password.' });
    }

    req.session.user = { id: user.id, username: user.username };
    res.status(200).json({ message: 'Login successful.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error.' });
  }
});


app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});


app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ message: 'Logout failed.' });
    }
    res.clearCookie('connect.sid');
    res.json({ message: 'Logout successful.' });
  });
});

import pagesRouter from './routes/pagesRouter.js';
app.use(pagesRouter);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("Server is running on port", PORT));
