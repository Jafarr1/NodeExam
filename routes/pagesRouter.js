import { Router } from 'express';
import ensureLoggedIn from './middlewareRouter.js';

const router = Router();

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/signup', (req, res) => {
  res.render('signup');
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
