import { Router } from 'express';
import { toggleFollow } from '../controllers/followController.ts';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.post('/:userId', authenticateToken, toggleFollow);

export default router;
