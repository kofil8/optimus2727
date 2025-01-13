import { Role } from '@prisma/client';
import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import UserController from './user.controller';
import { userValidation } from './user.validation';

const router = express.Router();

router.post(
  '/create',
  validateRequest(userValidation.createUserSchema),
  UserController.createUser
);

router.post('/otp-verify', UserController.verifyOtp);



router.put(
  '/update',
  auth(),
  UserController.updateUser
);


router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);


router.delete('/:id',
  auth(Role.ADMIN),
  UserController.deleteUser);

export const UserRoute = router;
