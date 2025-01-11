import express from 'express';

import { AuthRoutes } from '../modules/Auth/auth.routes';
import { UserRoute } from '../modules/User/user.route';
import { AlarmRoutes } from '../modules/Alarms/Alarm.route';



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
    path: '/',
    route: AlarmRoutes,
  }

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
