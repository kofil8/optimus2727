import express from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { AuthController } from './auth.controller';
import { authValidation } from './auth.validation';

const router = express.Router();

// user login route
router.post('/login', AuthController.loginUser);



// user logout route
router.post('/logout', auth(), AuthController.logoutUser);

router.get('/get-me', auth(), AuthController.getMyProfile);

router.put(
  '/change-password',
  validateRequest(authValidation.changePasswordValidationSchema),
  AuthController.changePassword
);

router.post("/forgot-password", AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;