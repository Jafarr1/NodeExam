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


export default router;