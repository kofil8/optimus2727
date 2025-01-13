import express from 'express';
import { PostController } from './post.controller';
import auth from '../../middlewares/auth';
import { fileUploader } from '../../../helpars/fileUploader';

const router = express.Router();

router.post(
  '/',
  auth(),
  fileUploader.uploadMultipleMedia,
  PostController.createPost
);
router.get('/', PostController.getAllPosts);
router.get('/:postId', PostController.getPostById);
router.put(
  '/:postId',
  auth(),
  fileUploader.uploadMultipleMedia,
  PostController.updatePost
);
router.delete('/:postId', auth(), PostController.deletePost);

export const PostRoutes = router;
