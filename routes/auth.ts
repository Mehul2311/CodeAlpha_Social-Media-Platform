import { Router } from 'express';
import { signup, login, logout, getCurrentUser } from '../controllers/authController.ts';
import { validateSignup, validateLogin } from '../middleware/validation.ts';
import { optionalToken } from '../middleware/auth.ts';

const router = Router();

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', optionalToken, getCurrentUser);

export default router;
