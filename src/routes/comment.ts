import Router from 'express';

import {
  addComment,
  reactToComment,
  getComments,
} from '../controllers/comment';
import auth from '../middleware/auth';

const router = Router();

router.post('/', auth, addComment);
router.put('/react-to-comment/:commentId', auth, reactToComment);
router.get('/:postId', auth, getComments);

export default router;
