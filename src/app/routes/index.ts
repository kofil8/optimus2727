import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoute } from '../modules/User/user.route';
import { PostRoutes } from '../modules/Posts/post.routes';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoute,
  },
  {
    path: '/posts',
    route: PostRoutes,
  }

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
