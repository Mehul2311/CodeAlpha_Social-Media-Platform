import { Router } from 'express';
import { 
  getFeed, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  toggleLike 
} from '../controllers/postsController.ts';
import { authenticateToken, optionalToken } from '../middleware/auth.ts';
import { validatePost } from '../middleware/validation.ts';

const router = Router();

router.get('/', optionalToken, getFeed);
router.get('/:id', optionalToken, getPostById);
router.post('/', authenticateToken, validatePost, createPost);
router.put('/:id', authenticateToken, validatePost, updatePost);
router.delete('/:id', authenticateToken, deletePost);
router.post('/:id/like', authenticateToken, toggleLike);

export default router;
