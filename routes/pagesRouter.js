import { Router } from 'express';
import path from 'path';

const router = Router();
const __dirname = process.cwd();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/login.html'));
});

router.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/signup.html'));
});

router.get('/', (req, res) => { 
    res.render('index');
});

    router.get('/white', (req, res) => {
        res.render('game', {
            color: 'white'
        });
    });
    router.get('/black', (req, res) => {
        if (!games[req.query.code]) {
            return res.redirect('/?error=invalidCode');
        }

        res.render('game', {
            color: 'black'
        });
    });

export default router;