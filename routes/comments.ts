import { Router } from 'express';
import { getPostComments, addComment, deleteComment } from '../controllers/commentsController.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { validateComment } from '../middleware/validation.ts';

const router = Router();

router.get('/post/:postId', getPostComments);
router.post('/post/:postId', authenticateToken, validateComment, addComment);
router.delete('/:id', authenticateToken, deleteComment);

export default router;
