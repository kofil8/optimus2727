import { Request, Response } from 'express';
import httpStatus from 'http-status';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';

const createUser = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.createUser(req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'User created successfully and OTP sent',
    data: result,
  });
});

const verifyOtp = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.verifyOtp(req.body);

  res.cookie('token', result, {
    secure: config.env === 'production',
    httpOnly: true,
    sameSite: 'none',
    maxAge: 1000 * 60 * 60 * 24 * 365,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'OTP verified successfully and Login successful',
    data: result,
  });
});

const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await UserService.getUserById(id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User fetched successfully',
    data: { ...user, password: undefined },
  });
});

const getAllUsers = catchAsync(async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();

  const data = users.map((user) => ({ ...user, password: undefined }));

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Users fetched successfully',
    data,
  });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
  const userId = req.params.id;
  const loggedId = req.user.id;

  await UserService.deleteUser(userId, loggedId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User deleted successfully',
  });
});



// update user first name and last name
const updateUser = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const data = req.body;

  const result = await UserService.updateUser(user?.email, data);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'User information updated successfully',
    data: result,
  });
});



const UserController = {
  createUser,
  verifyOtp,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUser,
};

export default UserController;
