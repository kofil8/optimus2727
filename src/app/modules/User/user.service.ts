import * as bcrypt from 'bcrypt';
import crypto from 'crypto';
import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import config from '../../../config';
import ApiError from '../../../errors/ApiErrors';
import emailSender from '../../../helpars/emailSender';
import { jwtHelpers } from '../../../helpars/jwtHelpers';
import prisma from '../../../shared/prisma';
import { IUser, UpdateUserInput } from './user.interface';

const createUser = async (payload: IUser) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      'This user information already exists'
    );
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.salt || 12
  );

  await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword,
    },
  });

  // Generate OTP and expiry
  const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const newOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0; line-height: 1.6;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
        <!-- Header Section -->
        <div style="background-color: #FF7600; background-image: linear-gradient(135deg, #FF7600, #45a049); padding: 30px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);">OTP Verification</h1>
        </div>

        <!-- Body Section -->
        <div style="padding: 20px 12px; text-align: center;">
            <p style="font-size: 18px; color: #333333; margin-bottom: 10px;">Hello,</p>
            <p style="font-size: 18px; color: #333333; margin-bottom: 20px;">Your OTP for verifying your account is:</p>
            <p style="font-size: 36px; font-weight: bold; color: #FF7600; margin: 20px 0; padding: 10px 20px; background-color: #f0f8f0; border-radius: 8px; display: inline-block; letter-spacing: 5px;">
                ${randomOtp}
            </p>
            <p style="font-size: 16px; color: #555555; margin-bottom: 20px; max-width: 400px; margin-left: auto; margin-right: auto;">
                Please enter this OTP to complete the verification process. This OTP is valid for 5 minutes.
            </p>

            <!-- Footer Message -->
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                <p style="font-size: 14px; color: #888888; margin-bottom: 4px;">Thank you for choosing our service!</p>
                <p style="font-size: 14px; color: #888888; margin-bottom: 0;">If you didn't request this OTP, please ignore this email.</p>
            </div>
        </div>

        <!-- Footer Section -->
        <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 12px; color: #999999;">
            <p style="margin: 0;">&copy; 2025 Office Alarm. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;

  await emailSender('OTP', payload.email, html);

  const identifier = crypto.randomBytes(16).toString('hex');

  await prisma.user.update({
    where: {
      email: payload.email,
    },
    data: {
      otp: randomOtp,
      otpExpiry: newOtpExpiry,
      hexCode: identifier,
    },
  });

  return {
    hexCode: identifier,
  };
};

const verifyOtp = async (payload: { otp: string; hexCode: string }): Promise<string> => {
  const user = await prisma.user.findFirst({
    where: {
      AND: [{ otp: payload.otp }, { hexCode: payload.hexCode }],
    },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid OTP');
  }

  if (user.otpExpiry && user.otpExpiry < new Date()) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'OTP has expired');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { otp: null, otpExpiry: null, hexCode: null, isOnline: true },
  });
  
    // Generate JWT token
    const accessToken = jwtHelpers.generateToken(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.jwt_secret as Secret,
      config.jwt.expires_in as string
  );
  
    return accessToken;
};


const getAllUsers = async () => {
  const users = await prisma.user.findMany();
  if (users.length === 0) {
    throw new ApiError(httpStatus.NOT_FOUND, 'No users found');
  }
  return users;
};

const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
};

const deleteUser = async (id: string, loggedId: string) => {
  const userId = id;
  if (!ObjectId.isValid(userId)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid user ID format');
  }

  if (userId === loggedId) {
    throw new ApiError(httpStatus.FORBIDDEN, "You can't delete your own account!");
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Check if logged in user has admin role
  const loggedInUser = await prisma.user.findUnique({
    where: { id: loggedId },
  });

  if (!loggedInUser || loggedInUser.role !== 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden! You are not authorized!');
  }

  // Delete the user
  await prisma.user.delete({
    where: { id: existingUser.id },
  });

  return;
};

// update user first name and last name
const updateUser = async (email: string, updates: UpdateUserInput) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  if ('password' in updates) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Password updates are not allowed');
  }

  const { firstName, lastName } = updates;

  const updatedUser = await prisma.user.update({
    where: { email },
    data: {
      firstName: firstName ?? user.firstName,
      lastName: lastName ?? user.lastName,
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
  verifyOtp,
  getAllUsers,
  getUserById,
  deleteUser,
  updateUser,
};

