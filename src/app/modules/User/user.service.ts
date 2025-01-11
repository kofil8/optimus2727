import * as bcrypt from 'bcrypt';
import httpStatus from 'http-status';
import ApiError from '../../../errors/ApiErrors';
import prisma from '../../../shared/prisma';
import { IUser, UpdateUserInput } from './user.interface';
import config from '../../../config';
import { ObjectId } from 'mongodb';

const createUser = async (payload: any) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This user information already exists'
    );
  }

  const existingUserName = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUserName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Username already exists!');
  }

  const hashedPassword = await bcrypt.hash(payload.password, config.salt || 12);

  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  const { password, otp, otpExpiry, hexCode, ...updateUser } = user;

  return updateUser;
};

const checkUserExists = async (email: string) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  return !!existingUser;
};

export { checkUserExists };

const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found');
  }
  return users;
};
// TODO: check this function
const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const deleteUser = async (userId: string, loggedId: string) => {
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(400, 'Invalid user ID format');
  }

  if (userId === loggedId) {
    throw new ApiError(403, "You can't delete your own account!");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(404, 'User not found');
  }

  // Delete the user
  await prisma.user.delete({
    where: { id: userId },
  });

  return;
};


// update user first name and last name
const updateUser = async (email: string, updates: UpdateUserInput) => {
  // console.log(email);

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if ('password' in updates) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'updates are not allowed');
  }

  const { firstName, lastName } = updates;

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
    },
    select: {
      id: true,
      email: true,
      createdAt: true,
      updatedAt: true,
      firstName: true,
      lastName: true,
    },
  });

  return updatedUser;
};

export const UserService = {
  createUser,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
};
