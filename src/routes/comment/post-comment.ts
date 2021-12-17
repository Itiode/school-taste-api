import Router from 'express';

import {
  addPostComment,
  reactToPostComment,
  getPostComments,
} from '../../controllers/comment/post-comment';
import auth from '../../middleware/auth';

const router = Router();

router.post('/', auth, addPostComment);
router.put('/react/:commentId', auth, reactToPostComment);
router.get('/:postId', auth, getPostComments);

export default router;
