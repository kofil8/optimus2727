import { Request, Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { AuthServices } from './auth.service';


const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthServices.login(req.body);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User logged in successfully',
    data: result,
  });
});


const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const id = req.user.id;
  await AuthServices.logoutUser(id as string);
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User Successfully logged out',
  });
});

// get user profile
const getMyProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.user;
  const result = await AuthServices.getMyProfile(id as string);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User profile retrieved successfully',
    data: result,
  });
});

// change password
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const userToken = req.headers.authorization;
  const { oldPassword, newPassword } = req.body;

  const result = await AuthServices.changePassword(
    userToken as string,
    newPassword,
    oldPassword
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Password changed successfully',
    data: result,
  });
});

// forgot password
const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const data = await AuthServices.forgotPassword(req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Check your email!',
    data: data,
  });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const token = req.headers.authorization || '';

  await AuthServices.resetPassword(token, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Password Reset!',
    data: null,
  });
});

export const AuthController = {
  loginUser,
  logoutUser,
  getMyProfile,
  changePassword,
  forgotPassword,
  resetPassword,
};
