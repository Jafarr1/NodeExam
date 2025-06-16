import { Router } from 'express';
import path from 'path';

// 🔧 You must have these defined or imported somewhere
import ensureLoggedIn from './middlewareRouter.js';

const router = Router();
const __dirname = process.cwd();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
});

router.get('/', ensureLoggedIn, (req, res) => {
  res.render('index');
});

router.get('/white', ensureLoggedIn, (req, res) => {
  res.render('game', {
    color: 'white',
    username: req.session.user.username,
    code: req.query.code
  });
});

router.get('/black', ensureLoggedIn, (req, res) => {
  if (!games[req.query.code]) {
    return res.redirect('/?error=invalidCode');
  }

  res.render('game', {
    color: 'black',
    username: req.session.user.username,
    code: req.query.code
  });
});

export default router;
