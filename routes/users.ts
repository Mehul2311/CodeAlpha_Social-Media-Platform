import { Router } from 'express';
import { 
  getUserProfile, 
  updateProfile, 
  getUserPosts, 
  getSuggestions, 
  getFollowers, 
  getFollowing 
} from '../controllers/usersController.ts';
import { authenticateToken, optionalToken } from '../middleware/auth.ts';

const router = Router();

router.get('/profile/:username', optionalToken, getUserProfile);
router.put('/profile', authenticateToken, updateProfile);
router.get('/posts/:username', optionalToken, getUserPosts);
router.get('/suggestions', optionalToken, getSuggestions);
router.get('/:username/followers', optionalToken, getFollowers);
router.get('/:username/following', optionalToken, getFollowing);

export default router;
