import express from 'express';
import session from 'express-session';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import handlebars from 'express-handlebars';
import http from 'http';
import { Server as SocketIO } from 'socket.io';
import myIo from './sockets/io.js'; 

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


import pagesRouter from './routes/pagesRouter.js';
app.use(pagesRouter);

import authRouter from './routes/authRouter.js';
app.use('/api', authRouter);

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log("Server is running on port", PORT));
